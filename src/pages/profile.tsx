import {ChangeEvent,FormEvent,useEffect,useState,useContext,} from "react";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import {fetchCurrentProfile,saveProfile,clearError,} from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ThemeContext } from "@/components/context/ThemeContext";
import UserLayout from "@/components/userLayout/Layout";
import toast from "react-hot-toast";

const ProfilePage: NextPage = () => {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useContext(ThemeContext)!;
  const { user, status: fetchStatus, error: fetchError } = useAppSelector(
    (s) => s.auth
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (user === null) {
      router.replace(
        `/auth/login?redirect=${encodeURIComponent("/profile")}`
      );
    }
  }, [user, router]);

  useEffect(() => {
    dispatch(clearError());
    dispatch(fetchCurrentProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPreviewUrl(user.profilePhoto ?? null);
    }
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selected = files[0];
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setFile(selected);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^[A-Za-z\s]+$/.test(val)) {
      setName(val);
      setNameError("");
    } else {
      setNameError("Name can only contain letters and spaces.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      setNameError("Name can only contain letters and spaces.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email);
    if (file) {
      formData.append("profilePhoto", file);
    }

    try {
      await dispatch(saveProfile(formData)).unwrap();
      toast.success("Profile updated successfully");
      setFile(null);
      dispatch(fetchCurrentProfile());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Could not update profile: " + msg);
    } finally {
      setSaving(false);
    }
  };

  if (fetchStatus === "loading") {
    return (
      <UserLayout>
        <div
          className={`min-h-screen flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-gray-50 text-gray-900"
          }`}
        >
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </UserLayout>
    );
  }

  if (fetchError) {
    return (
      <UserLayout>
        <div
          className={`min-h-screen flex items-center justify-center ${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-gray-50 text-gray-900"
          }`}
        >
          <p className="text-red-500">Error loading profile: {fetchError}</p>
        </div>
      </UserLayout>
    );
  }

  if (!user) return null;

  return (
    <UserLayout>
      <Head>
        <title>Rentify | Profile</title>
        <meta
          name="description"
          content="View and edit your profile details on Rentify, including your name, email, and profile photo."
        />
        <link rel="canonical" href="/profile" />
      </Head>
      <div
        className={`max-w-3xl mx-auto my-12 p-6 rounded-2xl shadow ${
          theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Profile Photo</label>
            <div className="flex items-center space-x-6">
              {previewUrl ? (
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={previewUrl}
                    alt="Profile Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`h-24 w-24 rounded-full flex items-center justify-center text-gray-500 ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                  }`}
                >
                  No Photo
                </div>
              )}
              <div>
                <input
                  id="profilePhoto"
                  name="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-600 file:text-white
                             hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or GIF — Max 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-400 text-gray-100"
                    : "bg-gray-50 border-gray-300 focus:ring-blue-500 text-gray-900"
                }`}
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-500">{nameError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                readOnly
                value={email}
                className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              readOnly
              value={user.role}
              className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-gray-100"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label className="block text-sm font-medium mb-1">Joined On</label>
              <input
                type="text"
                readOnly
                value={new Date(user.createdAt).toLocaleDateString()}
                className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Updated
              </label>
              <input
                type="text"
                readOnly
                value={new Date(user.updatedAt).toLocaleDateString()}
                className={`w-full px-4 py-2 rounded-lg border cursor-not-allowed ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={saving || !!nameError}
              className={`w-full py-3 rounded-lg text-lg font-medium shadow ${
                saving || nameError
                  ? "opacity-50 cursor-not-allowed"
                  : theme === "dark"
                  ? "bg-blue-700 text-white hover:bg-blue-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
};

export default ProfilePage;
