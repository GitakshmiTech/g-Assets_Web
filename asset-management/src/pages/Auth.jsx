import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, loginWithSsoCode, verifyMfaCode } from "../store/slices/authSlice";
import { getRoleHome, ROLE_OPTIONS } from "../utils/permissions";
import { fetchRoles, rolesToOptions } from "../utils/roleApi";
import { useToast } from "../components/toast/toastStore";
import { motion } from "framer-motion";
import { Smartphone, CheckCircle, AlertTriangle, X, AlertCircle } from "lucide-react";
import axios from "axios";
import "./Auth.css";

const buildAssetSsoLoginUrl = () => {
  const loginUrl = import.meta.env.VITE_GTONE_LOGIN_URL || "http://localhost:5174/#/login";
  const redirectUri = import.meta.env.VITE_ASSET_REDIRECT_URI || `${window.location.origin}/login`;
  const [baseUrl, hashRoute = ""] = loginUrl.split("#");
  const hasHashLogin = hashRoute.includes("/login");
  const url = new URL(baseUrl || window.location.origin);
  const targetParams = hasHashLogin
    ? new URLSearchParams(hashRoute.split("?")[1] || "")
    : url.searchParams;

  targetParams.set("app", "asset");
  targetParams.set("redirect_uri", redirectUri);

  if (hasHashLogin) {
    const hashPath = hashRoute.split("?")[0] || "/login";
    url.search = "";
    url.hash = `${hashPath}?${targetParams.toString()}`;
    return url.toString();
  }

  return url.toString();
};

const activeSsoPromises = {};

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const initialParams = new URLSearchParams(window.location.search);
  const initialCode = initialParams.get('code');
  const [ssoLoggingIn, setSsoLoggingIn] = useState(Boolean(initialCode && activeSsoPromises[initialCode]));
  const [ssoError, setSsoError] = useState("");

  // MFA Popup States
  const [mfaData, setMfaData] = useState(null);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaError, setMfaError] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkSsoStatus = async () => {
      try {
        const res = await axios.get("/api/auth/sso/status");
        if (isMounted && res.data) {
          setSsoEnabled(!!res.data.ssoEnabled);
        }
      } catch (err) {
        console.warn("Failed to check SSO status:", err);
      }
    };
    checkSsoStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");
    const errorDesc = params.get("description") || params.get("error_description");

    if (errorParam) {
      setSsoError(errorDesc || `SSO Error: ${errorParam}`);
      setSsoLoggingIn(false);
      return;
    }

    if (!code) {
      const justLoggedIn = sessionStorage.getItem("sso_login_success");
      if (justLoggedIn) {
        sessionStorage.removeItem("sso_login_success");
        setSsoError("Authentication succeeded but session could not be established. Please check your browser cookie settings.");
      }
      return;
    }

    setSsoLoggingIn(true);
    setSsoError("");

    if (!activeSsoPromises[code]) {
      activeSsoPromises[code] = dispatch(loginWithSsoCode({ code })).unwrap();
    }

    activeSsoPromises[code]
      .then((data) => {
        setSsoLoggingIn(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.setItem("sso_login_success", "true");
        navigate(getRoleHome(data.user.role), { replace: true });
      })
      .catch((err) => {
        setSsoLoggingIn(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        delete activeSsoPromises[code];
        setSsoError(err || "SSO Authentication failed.");
      });
  }, [dispatch, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      showToast({
        title: "Registration Success",
        message: location.state.message,
        type: "success",
      });
      // Preserve any existing redirect destination while clearing the toast message
      const preservedState = location.state.from ? { from: location.state.from } : {};
      navigate(location.pathname, { replace: true, state: preservedState });
    }
  }, [location.state, navigate, location.pathname, showToast]);

  const submit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email or username is required";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      if (result.payload.mfaRequired) {
        setMfaData(result.payload);
        setMfaToken("");
        setMfaError("");
        setMfaLoading(false);
      } else {
        navigate(getRoleHome(result.payload.user.role), { replace: true });
      }
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaToken || mfaToken.length !== 6) {
      setMfaError("Please enter a valid 6-digit code.");
      return;
    }

    setMfaLoading(true);
    setMfaError("");

    try {
      const result = await dispatch(verifyMfaCode({
        userId: mfaData.userId,
        token: mfaToken
      }));

      if (verifyMfaCode.fulfilled.match(result)) {
        setMfaData(null);
        navigate(getRoleHome(result.payload.user.role), { replace: true });
      } else {
        setMfaError(result.payload || "Invalid verification code. Please try again.");
      }
    } catch (err) {
      setMfaError("An error occurred during verification.");
    } finally {
      setMfaLoading(false);
    }
  };

  if (ssoLoggingIn) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "5px solid rgba(255, 255, 255, 0.1)",
          borderTop: "5px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: "20px", fontWeight: "bold", fontSize: "1.1rem" }}>
          Authenticating with g-Axis SSO...
        </p>
      </div>
    );
  }

  if (ssoError) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
        padding: "20px",
        textAlign: "center"
      }}>
        <div style={{
          background: "#fee2e2",
          color: "#dc2626",
          padding: "24px",
          borderRadius: "20px",
          maxWidth: "400px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
        }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "1.2rem" }}>SSO Authentication Error</h3>
          <p style={{ margin: "0 0 20px 0", fontSize: "0.95rem" }}>{ssoError}</p>
          <button
            onClick={() => window.location.replace(buildAssetSsoLoginUrl())}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: "#3b82f6",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Retry Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthSplitShell title="Login" subtitle="Use your GT AMS account to continue.">
      <form className="auth-form" onSubmit={submit} noValidate>
        <label>Email or Username</label>
        <input
          type="text"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          className={errors.email ? "input-error-border" : ""}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}

        <label>Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
          className={errors.password ? "input-error-border" : ""}
        />
        {errors.password && <span className="field-error">{errors.password}</span>}

        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Submit"}</button>
        {ssoEnabled && (
          <button
            type="button"
            onClick={() => window.location.replace(buildAssetSsoLoginUrl())}
            style={{
              background: "#eff6ff",
              color: "#ffffff",
              border: "1px solid #dbeafe",
              boxShadow: "none",
            }}
          >
            Login with GT_ONE
          </button>
        )}
        <p className="auth-link">New user? <Link to="/register">Register account</Link></p>
      </form>

      {/* MFA Setup/Verification Modal Overlay */}
      {mfaData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px"
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              position: "relative",
              fontFamily: "Inter, sans-serif"
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setMfaData(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#64748b"
              }}
            >
              <X size={20} />
            </button>

            <div style={{ padding: "28px" }}>
              {/* Header */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "#fff7ed",
                  color: "#f97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Smartphone size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0, textAlign: "left" }}>
                      Two-Factor Authentication (MFA)
                    </h3>
                  </div>
                  <div style={{
                    background: mfaData.mfaEnabled ? "#dcfce7" : "#fee2e2",
                    border: `1px solid ${mfaData.mfaEnabled ? "#bbf7d0" : "#fecaca"}`,
                    color: mfaData.mfaEnabled ? "#15803d" : "#dc2626",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "6px"
                  }}>
                    {mfaData.mfaEnabled ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                    {mfaData.mfaEnabled ? "ENABLED" : "NOT ENABLED"}
                  </div>
                </div>
              </div>

              <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.5", margin: "0 0 20px 0", textAlign: "left" }}>
                Add an extra layer of security to your account by requiring a code from your phone whenever you sign in.
              </p>

              {/* MFA Setup Section if not enabled */}
              {!mfaData.mfaEnabled ? (
                <div style={{
                  background: "#f8fafc",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "20px",
                  border: "1px solid #e2e8f0"
                }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0", textAlign: "left" }}>
                    Setup Authenticator App
                  </h4>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
                    <img 
                      src={mfaData.qrCode} 
                      alt="MFA QR Code" 
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        padding: "4px"
                      }}
                    />
                    <div style={{ flex: 1, fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4", textAlign: "left" }}>
                      <p style={{ margin: "0 0 8px 0" }}>
                        <strong>Step 1:</strong> Scan the QR code using Google Authenticator on your mobile device.
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Step 2:</strong> Enter the manual key if scanning is unsuccessful:
                        <span style={{
                          display: "block",
                          background: "#e2e8f0",
                          color: "#1e293b",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          marginTop: "4px",
                          wordBreak: "break-all"
                        }}>
                          {mfaData.secret}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Verification Form inside setup block to match reference design exactly! */}
                  <form onSubmit={handleMfaSubmit}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={mfaToken}
                        onChange={(e) => {
                          setMfaToken(e.target.value.replace(/\D/g, ""));
                          if (mfaError) setMfaError("");
                        }}
                        required
                        style={{
                          padding: "10px 12px",
                          borderRadius: "12px",
                          border: "1px solid #cbd5e1",
                          fontSize: "1.05rem",
                          letterSpacing: "2px",
                          textAlign: "center",
                          fontWeight: "bold",
                          outline: "none",
                          color: "#1e293b",
                          width: "130px",
                          boxSizing: "border-box"
                        }}
                      />
                      <button
                        type="submit"
                        disabled={mfaLoading}
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          borderRadius: "12px",
                          background: "#10b981",
                          color: "#ffffff",
                          fontWeight: "bold",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.9rem"
                        }}
                      >
                        {mfaLoading ? "Verifying..." : "Verify & Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfaData(null)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: "12px",
                          border: "1px solid #cbd5e1",
                          background: "transparent",
                          color: "#475569",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "0.9rem"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {mfaError && (
                      <span style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px", textAlign: "left" }}>
                        <AlertCircle size={14} /> {mfaError}
                      </span>
                    )}
                  </form>
                </div>
              ) : (
                /* Verification Form for already enabled MFA (matching first image design) */
                <form onSubmit={handleMfaSubmit}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", textAlign: "left" }}>
                      Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={mfaToken}
                      onChange={(e) => {
                        setMfaToken(e.target.value.replace(/\D/g, ""));
                        if (mfaError) setMfaError("");
                      }}
                      required
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        fontSize: "1.1rem",
                        letterSpacing: "4px",
                        textAlign: "center",
                        fontWeight: "bold",
                        outline: "none",
                        color: "#1e293b",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                    />
                    {mfaError && (
                      <span style={{ color: "#dc2626", fontSize: "0.85rem", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px", textAlign: "left" }}>
                        <AlertCircle size={14} /> {mfaError}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="submit"
                      disabled={mfaLoading}
                      style={{
                        flex: 1,
                        padding: "12px 20px",
                        borderRadius: "12px",
                        background: "#2563eb",
                        color: "#ffffff",
                        fontWeight: "bold",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.95rem"
                      }}
                    >
                      {mfaLoading ? "Verifying..." : "Verify & Log in"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMfaData(null)}
                      style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        background: "transparent",
                        color: "#475569",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "0.95rem"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AuthSplitShell>
  );
}
export function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [roleOptions, setRoleOptions] = useState(ROLE_OPTIONS);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    employeeId: "",
    role: "EMPLOYEE",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoles().then((roles) => {
      const options = rolesToOptions(roles);
      if (options.length) setRoleOptions(options);
    });
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username.trim())) {
      newErrors.username = "Username must be 3-30 characters (letters, numbers, underscore only)";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Password and confirm password must match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const payload = {
      name: form.name,
      username: form.username.trim(),
      email: form.email,
      employeeId: form.employeeId,
      role: form.role,
      password: form.password,
    };
    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      navigate("/login", {
        replace: true,
        state: { message: "Registration completed. Please login with your email/username and password." },
      });
    }
  };

  return (
    <AuthSplitShell title="Register" subtitle="Create a role-based account for GT AMS.">
      <form className="auth-form" onSubmit={submit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={errors.name ? "input-error-border" : ""}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => {
                setForm({ ...form, username: e.target.value });
                if (errors.username) setErrors({ ...errors, username: "" });
              }}
              className={errors.username ? "input-error-border" : ""}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              className={errors.email ? "input-error-border" : ""}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label>Employee ID</label>
            <input
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label>Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              className={errors.password ? "input-error-border" : ""}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
              }}
              className={errors.confirmPassword ? "input-error-border" : ""}
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
        <p className="auth-link">Already registered? <Link to="/login">Login</Link></p>
      </form>
    </AuthSplitShell>
  );
}

function AuthSplitShell({ title, subtitle, children }) {
  return (
    <div className="auth-split-wrapper">
      
      {/* Left Pane: White background with Logo and Title */}
      <div className="auth-left-pane">
        <div className="auth-left-content">
          <img 
            src="/logo.png" 
            alt="Gitakshmi logo" 
            className="auth-logo-img"
          />
          <h1 className="auth-left-title">Asset Management System</h1>
          <p className="auth-left-subtitle">
            Streamline your team's assets, lifecycles, specifications, and workflows with secure tracking and real-time management.
          </p>
        </div>
      </div>

      {/* Right Pane: Vibrant Blue background containing the clean white login card */}
      <div className="auth-right-pane">
        <div className="auth-card" style={{ maxWidth: title === "Register" ? "560px" : "440px" }}>
          <div className="auth-card-header">
            <h2 className="auth-card-title">
              {title === "Login" ? "Welcome Back!!" : title}
            </h2>
            <p className="auth-card-subtitle">
              {title === "Login" ? "Sign in with your email and password" : subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>

    </div>
  );
}

function AuthClassicShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <span>GT AMS</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
