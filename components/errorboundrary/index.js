"use client";

import React from "react";
import { Button } from "../ui/button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can use your own error logging service here
    console.log({ error, errorInfo });
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="bg-red-50 w-full rounded-lg py-10 px-5 text-center">
          <h2 className="mb-5">Oops, there is an error!</h2>
          <Button
            type="button"
            variant="destructive"
            onClick={() => this.setState({ hasError: false })}
          >
            {" "}
            Reset
          </Button>
        </div>
      );
    }

    // Return children components in case of no error

    return this.props.children;
  }
}

export default ErrorBoundary;
