// Simple test to verify Jest is working
describe("Basic Jest Test", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should handle async operations", async () => {
    const result = await Promise.resolve("test");
    expect(result).toBe("test");
  });

  it("should handle arrays", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it("should handle objects", () => {
    const obj = { name: "test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj.name).toBe("test");
  });
});
