import Navbar from "../../components/Navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/Inputs/PasswordInput";
import { useState } from "react";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { auth, provider } from "../../utils/firebaseConfig";
import { signInWithPopup } from "firebase/auth";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleAuth = async () => {
    await signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;

        try {
          const response = await axiosInstance.post("/generate-token", {
            email: user.email,
            fullName: user.displayName,
          });

          if (response.data && response.data.customToken) {
            localStorage.setItem("token", response.data.customToken);
            navigate("/dashboard");
          }

        } catch (error) {
          console.error('Authentication error:', error);
          setError('Authentication failed. Please try again.');
        }
      });
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    //Login API Call
    try {
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });

      //Handle successful login response
      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard");
      }

    } catch (error) {
      //Handle login error
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occured. Please try again.");
      }
    }
  }

  return (
    <>
      <Navbar />

      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl mb-7">Login</h4>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="input-box"
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">Login</button>

            <button onClick={handleAuth}>Login with Google</button>

            <p className="text-sm text-center mt-4">
              {`Don't have an account?`}{" "}
              <Link to="/signup" className="font-medium text-primary underline">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </>

  )
}
export default Login