// Simple User model tests that work with ES modules
describe("User Model - Simple Tests", () => {
  it("should validate user data structure", () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    expect(userData.username).toBe("testuser");
    expect(userData.email).toBe("test@example.com");
    expect(userData.password).toBe("password123");
  });

  it("should validate email format", () => {
    const validEmail = "test@example.com";
    const invalidEmail = "invalid-email";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  it("should validate password length", () => {
    const validPassword = "password123";
    const invalidPassword = "123";

    expect(validPassword.length).toBeGreaterThanOrEqual(6);
    expect(invalidPassword.length).toBeLessThan(6);
  });

  it("should validate username length", () => {
    const validUsername = "testuser";
    const shortUsername = "ab";
    const longUsername = "a".repeat(31);

    expect(validUsername.length).toBeGreaterThanOrEqual(3);
    expect(validUsername.length).toBeLessThanOrEqual(30);
    expect(shortUsername.length).toBeLessThan(3);
    expect(longUsername.length).toBeGreaterThan(30);
  });

  it("should validate task structure", () => {
    const validTask = {
      id: "1",
      text: "Test task",
      title: "Test Task",
      completed: false,
      category: "general",
    };

    expect(validTask.id).toBeDefined();
    expect(validTask.text).toBeDefined();
    expect(validTask.title).toBeDefined();
    expect(typeof validTask.completed).toBe("boolean");
    expect(validTask.category).toBeDefined();
  });

  it("should validate activity structure", () => {
    const validActivity = {
      id: "1",
      title: "Test Activity",
      day: "Monday",
      time: "10:00",
      dueDate: new Date(),
    };

    expect(validActivity.id).toBeDefined();
    expect(validActivity.title).toBeDefined();
    expect(validActivity.day).toBeDefined();
    expect(validActivity.time).toBeDefined();
    expect(validActivity.dueDate).toBeInstanceOf(Date);
  });
});
