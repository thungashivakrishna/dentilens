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

  it("navigates to dashboard on login press", () => {
    const replaceMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ replace: replaceMock });

    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText("Login"));

    expect(replaceMock).toHaveBeenCalledWith("/(tabs)");
  });
});
