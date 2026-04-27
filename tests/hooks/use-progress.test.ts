import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProgress } from "@/hooks/use-progress";

const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockLocalStorage).forEach(
    (key) => delete mockLocalStorage[key]
  );
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
    },
    writable: true,
  });
});

describe("useProgress", () => {
  it("starts with empty progress", () => {
    const { result } = renderHook(() => useProgress());
    expect(result.current.getTopicProgress("numbers")).toEqual({
      correct: 0,
      total: 0,
    });
  });

  it("records a correct answer", () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.recordAnswer("numbers", "q1", true);
    });

    expect(result.current.getTopicProgress("numbers")).toEqual({
      correct: 1,
      total: 1,
    });
  });

  it("records an incorrect answer", () => {
    const { result } = renderHook(() => useProgress());

    act(() => {
      result.current.recordAnswer("numbers", "q1", false);
    });

    expect(result.current.getTopicProgress("numbers")).toEqual({
      correct: 0,
      total: 1,
    });
  });
});
