import { createFileRoute } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { useGetUser, useUpdateUser, useDeleteUser } from '@/hooks/useUser';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import { LayoutWithSidebar } from '@/components/LayoutWithSidebar';
import { motion } from 'framer-motion';

// Cloudinary upload utility (add this to src/lib/cloudinaryUpload.ts if not present)
async function uploadImageToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/<your-cloud-name>/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', '<your-upload-preset>');
  const response = await fetch(url, { method: 'POST', body: formData });
  if (!response.ok) throw new Error('Failed to upload image');
  const data = await response.json();
  return data.secure_url;
}

export const Route = createFileRoute('/admin/settings/profile')({
  component: ProfilePage,
});
function ProfilePage() {
  const authUser = useAuthStore((s) => s.user);
  const { data: user, isLoading, isError } = useGetUser(authUser?.id || '');
  const updateUser = useUpdateUser();
  const updateUserStore = useAuthStore((s) => s.updateUser);
  const deleteUser = useDeleteUser();
  const logout = useAuthStore((s) => s.logout);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    profileImage: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div></div>;
  if (isError || !user) return <div className="bg-red-50 border border-red-200 rounded-lg p-6">Error loading profile</div>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setForm((prev) => ({ ...prev, profileImage: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      let imageUrl = form.profileImage;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      const payload = {
        id: user.id,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        address: form.address,
        profileImage: imageUrl,
        role: user.role,
      };
      await updateUser.mutateAsync({ id: user.id, user: payload });
      updateUserStore(payload);
      toast.success('Profile updated successfully!');
      setUploading(false);
      setEditing(false);
    } catch (err: any) {
      toast.error('Failed to update profile');
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success('Account deleted.');
      logout();
      window.location.href = '/login';
    } catch (err) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <LayoutWithSidebar>
      <div className="p-6 flex justify-center items-start min-h-[80vh] bg-gradient-to-br from-orange-50 via-white to-green-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(255, 122, 0, 0.15)' }}
          transition={{ type: 'spring', stiffness: 120 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-orange-200 px-10 py-12 flex flex-col items-center relative"
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors shadow-sm"
              onClick={() => setEditing((e) => !e)}
              title="Update Profile"
            >
              <Edit className="h-5 w-5 mr-2" />
              {editing ? 'Cancel' : 'Update'}
            </button>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
              onClick={handleDelete}
              title="Delete Account"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete
            </button>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="h-32 w-32 mb-4 relative group">
              {form.profileImage ? (
                <img
                  src={form.profileImage}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover border-4 border-orange-300 shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-orange-100 flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-orange-600" />
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</div>
            <div className="text-base text-gray-500">ID: {user.id}</div>
          </div>
          <div className="w-full space-y-5 mb-8">
            <div className="flex items-center text-base text-gray-700">
              <Mail className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center text-base text-gray-700">
              <Phone className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0" />
              <span>{user.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="flex items-start text-base text-gray-700">
              <MapPin className="h-5 w-5 mr-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{user.address || 'Not provided'}</span>
            </div>
          </div>
          {editing && (
            <motion.form
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="w-full mt-4 bg-orange-50 rounded-2xl p-6 shadow-inner flex flex-col gap-4"
              onSubmit={e => { e.preventDefault(); handleSave(); }}
            >
              <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-24 mb-2">
                  <img
                    src={form.profileImage || '/logo192.png'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-200 shadow"
                  />
                  <button
                    className="absolute bottom-2 right-2 bg-orange-500 text-white rounded-full p-2 shadow hover:bg-orange-600"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile picture"
                    type="button"
                  >
                    <span className="sr-only">Change</span>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.5"/><path d="M4.5 19.5v-2.75A2.75 2.75 0 0 1 7.25 14h9.5A2.75 2.75 0 0 1 19.5 16.75v2.75" stroke="currentColor" strokeWidth="1.5"/><path d="M16.5 7.5V6.75A2.25 2.25 0 0 0 14.25 4.5h-4.5A2.25 2.25 0 0 0 7.5 6.75V7.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </LayoutWithSidebar>
  );
}

