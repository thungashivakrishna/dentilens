import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import WelcomeScreen from "../app/index";
import { useRouter } from "expo-router";

// Mock useRouter
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

describe("WelcomeScreen", () => {
  it("renders correctly with brand title", () => {
    const { getByText } = render(<WelcomeScreen />);
    expect(getByText("DentiLens")).toBeTruthy();
    expect(getByText("Precision Dental Analytics")).toBeTruthy();
  });

  it("navigates to login when 'Get Started' is pressed", () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    const { getByText } = render(<WelcomeScreen />);
    fireEvent.press(getByText("Get Started"));

    expect(pushMock).toHaveBeenCalledWith("/(auth)/login");
  });
});
