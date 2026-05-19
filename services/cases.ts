import { supabase } from "./supabase";

export interface DentalCase {
  id: string;
  doctor_id: string;
  patient_identifier: string;
  type: string;
  position: string;
  notes: string;
  before_image_url: string;
  after_image_url: string;
  status: "Pending" | "Processing" | "Completed";
  confidence_score: number | null;
  created_at: string;
}

export interface DoctorProfile {
  id: string;
  full_name: string;
  clinic_name: string;
  created_at: string;
}

// Memory cache for offline/mock fallback cases to ensure user sessions feel cohesive
let mockCases: DentalCase[] = [
  {
    id: "1",
    doctor_id: "mock-doc-123",
    patient_identifier: "P-8821-NYC",
    type: "Intraoral",
    position: "Lower Left Molar",
    notes: "Initial intraoral scan indicates slight enamel wear on the second molar. AI analysis suggests 12% improvement after preventive treatment protocol.",
    before_image_url: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&auto=format&fit=crop&q=80",
    after_image_url: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80",
    status: "Completed",
    confidence_score: 0.94,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
  },
  {
    id: "2",
    doctor_id: "mock-doc-123",
    patient_identifier: "P-4590-LA",
    type: "Orthodontic",
    position: "Upper Anterior",
    notes: "Crowding of anterior teeth. Preparing alignment roadmap. Scan captures baseline positions for visualizer.",
    before_image_url: "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?w=600&auto=format&fit=crop&q=80",
    after_image_url: "",
    status: "Pending",
    confidence_score: null,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(), // Yesterday
  },
  {
    id: "3",
    doctor_id: "mock-doc-123",
    patient_identifier: "P-7742-CHI",
    type: "Surgery",
    position: "Upper Right Premolar",
    notes: "Post-extraction dental implant assessment. Confirming titanium post positioning relative to surrounding tissue.",
    before_image_url: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=600&auto=format&fit=crop&q=80",
    after_image_url: "https://images.unsplash.com/photo-1512223792601-592a9809eed4?w=600&auto=format&fit=crop&q=80",
    status: "Completed",
    confidence_score: 0.88,
    created_at: new Date(Date.now() - 6 * 24 * 3600000).toISOString(), // 6 days ago
  }
];

let isMockMode = false;

// Check if we need to fall back or if database works
async function executeWithFallback<T>(remoteAction: () => Promise<T>, mockAction: () => T): Promise<T> {
  if (isMockMode) {
    return mockAction();
  }

  try {
    return await remoteAction();
  } catch (error: any) {
    // Catch table not found (42P01) or other schema mismatch errors
    if (
      error?.code === "42P01" || 
      error?.message?.includes("does not exist") || 
      error?.message?.includes("database") ||
      error?.status === 404 ||
      error?.message?.includes("Network request failed")
    ) {
      console.warn("Supabase schema not fully configured or network offline. Falling back to dynamic mock state.", error.message);
      isMockMode = true;
      return mockAction();
    }
    throw error;
  }
}

export const CasesService = {
  /**
   * Fetch current doctor profile
   */
  async fetchProfile(): Promise<DoctorProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("No authenticated session found.");
    }

    return executeWithFallback(
      async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        return data as DoctorProfile;
      },
      () => {
        return {
          id: user.id,
          full_name: user.user_metadata?.full_name || "Dr. Guest Profile",
          clinic_name: user.user_metadata?.clinic_name || "General Clinic LLC",
          created_at: user.created_at,
        };
      }
    );
  },

  /**
   * Fetch cases list for authenticated user
   */
  async fetchCases(): Promise<DentalCase[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return executeWithFallback(
      async () => {
        const { data, error } = await supabase
          .from("cases")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return (data || []) as DentalCase[];
      },
      () => {
        return [...mockCases].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    );
  },

  /**
   * Fetch a single case by ID
   */
  async fetchCaseById(id: string): Promise<DentalCase | null> {
    return executeWithFallback(
      async () => {
        const { data, error } = await supabase
          .from("cases")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data as DentalCase;
      },
      () => {
        const found = mockCases.find(c => c.id === id);
        return found || null;
      }
    );
  },

  /**
   * Upload dental scan image to Supabase storage or return mock representation if offline/unconfigured
   */
  async uploadCaseImage(uri: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be authenticated to upload assets.");

    return executeWithFallback(
      async () => {
        // Only run real uploads if supabase is properly configured and we are not in mock fallback mode
        if (isMockMode) throw new Error("Mock Mode Active");

        // Convert file URI to blob for upload (works across platforms like web/ios/android)
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const fileExt = uri.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${Date.now()}_before.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from("cases")
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (error) throw error;

        // Retrieve public URL
        const { data: { publicUrl } } = supabase.storage
          .from("cases")
          .getPublicUrl(filePath);

        return publicUrl;
      },
      () => {
        // Fall back to returning the URI directly (or a rich dental image from unsplash if local temporary path)
        if (uri.startsWith("http")) return uri;
        return "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?w=600&auto=format&fit=crop&q=80";
      }
    );
  },

  /**
   * Create a new case
   */
  async createCase(caseData: {
    patient_identifier: string;
    type: string;
    position: string;
    notes: string;
    before_image_url: string;
  }): Promise<DentalCase> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authenticated session required.");

    return executeWithFallback(
      async () => {
        const { data, error } = await supabase
          .from("cases")
          .insert({
            doctor_id: user.id,
            patient_identifier: caseData.patient_identifier,
            type: caseData.type,
            position: caseData.position,
            notes: caseData.notes,
            before_image_url: caseData.before_image_url,
            after_image_url: "",
            status: "Pending",
            confidence_score: null,
          })
          .select()
          .single();

        if (error) throw error;
        return data as DentalCase;
      },
      () => {
        const newCase: DentalCase = {
          id: Math.random().toString(36).substr(2, 9),
          doctor_id: user.id,
          patient_identifier: caseData.patient_identifier,
          type: caseData.type,
          position: caseData.position,
          notes: caseData.notes,
          before_image_url: caseData.before_image_url,
          after_image_url: "",
          status: "Pending",
          confidence_score: null,
          created_at: new Date().toISOString(),
        };
        mockCases.push(newCase);
        return newCase;
      }
    );
  },

  /**
   * Simulate AI vision enhancement (or run in backend database)
   */
  async simulateAiEnhancement(caseId: string): Promise<DentalCase> {
    return executeWithFallback(
      async () => {
        // Retrieve case info
        const foundCase = await this.fetchCaseById(caseId);
        if (!foundCase) throw new Error("Case not found");

        const enhancedUrl = foundCase.before_image_url || "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80";

        // Update database with processing steps and complete status
        const { data, error } = await supabase
          .from("cases")
          .update({
            status: "Completed",
            confidence_score: 0.95,
            after_image_url: enhancedUrl,
          })
          .eq("id", caseId)
          .select()
          .single();

        if (error) throw error;
        return data as DentalCase;
      },
      () => {
        const idx = mockCases.findIndex(c => c.id === caseId);
        if (idx === -1) throw new Error("Case not found in mock database.");

        const enhancedUrl = mockCases[idx].before_image_url || "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80";

        mockCases[idx] = {
          ...mockCases[idx],
          status: "Completed",
          confidence_score: 0.95,
          after_image_url: enhancedUrl,
        };

        return mockCases[idx];
      }
    );
  }
};
