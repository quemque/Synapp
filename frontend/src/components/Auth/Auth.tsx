import { FormEvent, useState } from "react";
import { authAPI } from "../../services/api";
import { AuthResponse, FormData } from "../../types/index";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let response: AuthResponse;
      if (isLogin) {
        response = await authAPI.login({
          loginIdentifier: formData.email,
          password: formData.password,
        });
      } else {
        response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
      }

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        alert("Success!");
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert("Error: " + error.message);
      }
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Register" : "Have an account? Login"}
      </button>
    </div>
  );
};
