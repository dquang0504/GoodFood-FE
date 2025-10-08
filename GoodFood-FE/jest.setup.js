import "@testing-library/jest-dom";

jest.mock("chart.js", () => {
  const ActualChartJS = jest.requireActual("chart.js");
  return {
    ...ActualChartJS,
    Chart: jest.fn().mockImplementation(() => ({
      destroy: jest.fn(),
      update: jest.fn(),
    })),
  };
});
