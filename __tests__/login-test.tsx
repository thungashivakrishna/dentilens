import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "../app/(auth)/login";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("LoginScreen", () => {
  it("renders email and password inputs", () => {
    const { getByPlaceholderText } = render(<LoginScreen />);
    expect(getByPlaceholderText("dr.smith@clinic.com")).toBeTruthy();
    expect(getByPlaceholderText("••••••••")).toBeTruthy();
  });

  it("navigates to dashboard on login press", async () => {
    const replaceMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    // Fill in email and password fields to pass validation check
    fireEvent.changeText(getByPlaceholderText("dr.smith@clinic.com"), "dr.smith@clinic.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "password123");
    
    // Press the login button
    fireEvent.press(getByText("Login"));

    // Await promise loop tick for async sign-in execution
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(replaceMock).toHaveBeenCalledWith("/(tabs)");
  });
});
