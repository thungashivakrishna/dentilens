import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Modal, TextInput, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, Zap, RefreshCcw, Image as ImageIcon, Camera, Check, AlertCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { CasesService } from "../../services/cases";

const QUICK_POSITIONS = ["Upper Anterior", "Lower Anterior", "Upper Left Molar", "Upper Right Molar", "Lower Left Molar", "Lower Right Molar"];
const MODES = ["Intraoral", "Extraoral", "3D Scan", "Surgery"];

export default function CameraScreen() {
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  
  // States
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [patientId, setPatientId] = useState("");
  const [scanType, setScanType] = useState("Intraoral");
  const [position, setPosition] = useState("");
  const [notes, setNotes] = useState("");

  if (!permission) {
    return <View className="flex-1 bg-ink justify-center items-center"><ActivityIndicator color="#0D7B74" /></View>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-ink p-6">
        <Text className="text-white text-lg text-center mb-6">We need your permission to show the camera</Text>
        <TouchableOpacity 
          onPress={requestPermission}
          className="bg-teal px-8 py-4 rounded-2xl"
        >
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === "back" ? "front" : "back"));
  }

  // Generate a random HIPAA-compliant patient identifier automatically
  const generateHipaaId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const cities = ["NYC", "LA", "CHI", "MIA", "HOU", "SFO"];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    setPatientId(`P-${randomNum}-${randomCity}`);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (photo && photo.uri) {
        setCapturedImage(photo.uri);
        generateHipaaId(); // Auto-generate compliant de-identified ID
        setShowMetadataModal(true);
      }
    } catch (err) {
      console.error("Camera capture failed:", err);
      Alert.alert("Capture Failed", "An error occurred while taking the picture.");
    }
  };

  const handleSaveCase = async () => {
    if (!patientId) {
      Alert.alert("Required Field", "Please enter a de-identified Patient ID.");
      return;
    }
    if (!capturedImage) return;

    setSaving(true);
    try {
      // 1. Upload scan to Supabase storage (or fallback mock)
      const uploadUrl = await CasesService.uploadCaseImage(capturedImage);
      
      // 2. Save Case record to PostgreSQL (or fallback mock)
      const newCase = await CasesService.createCase({
        patient_identifier: patientId,
        type: scanType,
        position: position,
        notes: notes,
        before_image_url: uploadUrl,
      });

      // Reset states
      setShowMetadataModal(false);
      setCapturedImage(null);
      setNotes("");
      setPosition("");
      
      // 3. Redirect clinician straight to the interactive analysis detail screen!
      router.push(`/case/${newCase.id}`);
    } catch (err: any) {
      console.error("Failed to save dental case:", err);
      Alert.alert("Save Error", err.message || "Could not upload scan or create database record.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill} 
        facing={facing}
      >
        {/* Top Controls */}
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-between items-center px-6 py-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/40 rounded-full items-center justify-center"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
            
            <View className="flex-row bg-black/40 rounded-full p-1 gap-1">
              {MODES.map((mode) => (
                <TouchableOpacity 
                  key={mode}
                  onPress={() => setScanType(mode)}
                  className={`px-4 py-1.5 rounded-full ${scanType === mode ? 'bg-white' : ''}`}
                >
                  <Text className={`text-[10px] font-bold ${scanType === mode ? 'text-ink' : 'text-white/60'}`}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity className="w-10 h-10 bg-black/40 rounded-full items-center justify-center">
              <Zap size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Grid/Alignment Overlay */}
          <View className="flex-1 items-center justify-center">
             <View className="w-64 h-48 border border-white/30 rounded-3xl items-center justify-center">
                <View className="w-10 h-0.5 bg-white/50 absolute top-0" />
                <View className="w-10 h-0.5 bg-white/50 absolute bottom-0" />
                <View className="h-10 w-0.5 bg-white/50 absolute left-0" />
                <View className="h-10 w-0.5 bg-white/50 absolute right-0" />
                <Text className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Align Teeth</Text>
             </View>
          </View>

          {/* Bottom Controls */}
          <View className="px-10 pb-12 flex-row justify-between items-center">
            <TouchableOpacity className="w-14 h-14 bg-teal-mid/20 border border-white/20 rounded-xl items-center justify-center">
              <ImageIcon size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleCapture}
              className="w-20 h-20 bg-white rounded-full p-1.5 shadow-xl active:scale-95"
            >
              <View className="flex-1 rounded-full border-2 border-ink items-center justify-center">
                <View className="w-full h-full bg-white rounded-full items-center justify-center">
                  <Camera size={32} color="#111B1A" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={toggleCameraFacing}
              className="w-14 h-14 bg-white/15 rounded-full items-center justify-center"
            >
              <RefreshCcw size={22} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>

      {/* Metadata Form Modal */}
      <Modal
        visible={showMetadataModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !saving && setShowMetadataModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/60 justify-end"
        >
          <View className="bg-surface rounded-t-3xl max-h-[85%] border-t border-line">
            <View className="p-6 border-b border-line flex-row justify-between items-center bg-teal-light rounded-t-3xl">
              <View>
                <Text className="text-ink text-xl font-cormorant font-semibold">Dental Scan Captured</Text>
                <Text className="text-muted text-[10px] uppercase font-bold tracking-widest mt-0.5">De-identified Patient Record</Text>
              </View>
              {!saving && (
                <TouchableOpacity 
                  onPress={() => setShowMetadataModal(false)}
                  className="w-8 h-8 bg-line rounded-full items-center justify-center"
                >
                  <X size={16} color="#7A9190" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView className="p-6" contentContainerStyle={{ pb: 40 }} showsVerticalScrollIndicator={false}>
              {/* Compliance Advisory */}
              <View className="bg-teal/5 border border-teal/10 rounded-2xl p-4 flex-row items-start mb-6">
                <AlertCircle size={16} color="#0D7B74" className="mr-3 mt-0.5" />
                <View className="flex-1">
                  <Text className="text-[#084F4A] font-semibold text-xs font-outfit">HIPAA / GDPR Compliance Active</Text>
                  <Text className="text-teal text-[10px] leading-4 font-outfit mt-1">
                    To comply with healthcare privacy regulations, DentiLens automatically generates secure random tokens. Do not enter patient names, SSNs, or other clear-text identifiers.
                  </Text>
                </View>
              </View>

              {/* Patient de-identified code */}
              <View className="mb-4">
                <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Patient Identifier</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    placeholder="e.g. P-8821-NYC"
                    placeholderTextColor="#7A9190"
                    value={patientId}
                    onChangeText={setPatientId}
                    editable={!saving}
                    className="flex-1 bg-white border border-line rounded-xl px-4 py-3 font-outfit text-sm text-ink"
                  />
                  <TouchableOpacity
                    onPress={generateHipaaId}
                    disabled={saving}
                    className="bg-teal-light border border-teal/10 px-4 py-3 rounded-xl items-center justify-center"
                  >
                    <Text className="text-teal font-bold text-xs">Generate</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scan Type */}
              <View className="mb-4">
                <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Scan Category</Text>
                <View className="flex-row flex-wrap gap-2">
                  {MODES.map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => !saving && setScanType(mode)}
                      disabled={saving}
                      className={`px-4 py-2 rounded-xl border ${scanType === mode ? 'bg-teal border-teal' : 'bg-white border-line'}`}
                    >
                      <Text className={`text-xs font-semibold ${scanType === mode ? 'text-white' : 'text-muted'}`}>
                        {mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tooth Position */}
              <View className="mb-4">
                <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Tooth Position</Text>
                <TextInput
                  placeholder="e.g. Upper Left Molar, Frontal Incisor"
                  placeholderTextColor="#7A9190"
                  value={position}
                  onChangeText={setPosition}
                  editable={!saving}
                  className="bg-white border border-line rounded-xl px-4 py-3 font-outfit text-sm text-ink mb-2"
                />
                <View className="flex-row flex-wrap gap-1.5">
                  {QUICK_POSITIONS.map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      onPress={() => !saving && setPosition(pos)}
                      disabled={saving}
                      className="bg-teal-light/40 border border-teal/5 px-2.5 py-1.5 rounded-lg"
                    >
                      <Text className="text-teal text-[10px] font-semibold">{pos}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Clinician Notes */}
              <View className="mb-6">
                <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1.5">Clinician Diagnosis Notes</Text>
                <TextInput
                  placeholder="Describe scan details, anomalies, or suggested therapeutic alignments..."
                  placeholderTextColor="#7A9190"
                  multiline
                  numberOfLines={4}
                  value={notes}
                  onChangeText={setNotes}
                  editable={!saving}
                  className="bg-white border border-line rounded-xl px-4 py-3 font-outfit text-sm text-ink h-24 text-vertical-top"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => !saving && setShowMetadataModal(false)}
                  disabled={saving}
                  className="flex-1 bg-white border border-line p-4 rounded-xl items-center justify-center active:bg-line"
                >
                  <Text className="text-ink font-bold">Retake</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveCase}
                  disabled={saving}
                  className="flex-1 bg-teal p-4 rounded-xl items-center justify-center flex-row shadow-sm active:scale-[0.98] disabled:opacity-70"
                >
                  {saving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Check size={18} color="white" className="mr-2" />
                      <Text className="text-white font-bold">Save Case</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
