import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Edit,
} from 'lucide-react';
import { useUpdateUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export const Route = createFileRoute('/user/settings/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, token } = useAuthStore();
  const updateUser = useUpdateUser();
  const updateUserStore = useAuthStore((s) => s.updateUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    address: user?.address || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      address: user?.address || '',
      phoneNumber: user?.phoneNumber || '',
    });
  };
  const handleSave = async () => {
    if (!user || !token) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    try {
      setUploading(true);
      const payload = {
        fullName: form.fullName,
        email: form.email, // not editable, but sent for completeness
        phoneNumber: form.phoneNumber,
        address: form.address,
        role: user.role,
      };

      await updateUser.mutateAsync({
        id: String(user.id),
        user: payload as any
      });

      updateUserStore(payload);
      toast.success('Profile updated successfully!');
      setUploading(false);
      setEditMode(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update profile';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        toast.error('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        toast.error(errorMessage);
      }
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="p-6">No user found. Please log in.</div>;
  }

  return (
    <div className="p-6 flex justify-center items-start min-h-[80vh] bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-orange-200 px-10 py-12 flex flex-col items-center relative">
        <button
          className="absolute top-4 right-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors shadow-sm"
          onClick={editMode ? handleCancel : handleEdit}
          title={editMode ? 'Cancel' : 'Edit Profile'}
        >
          <Edit className="h-5 w-5 mr-2" />
          {editMode ? 'Cancel' : 'Edit'}
        </button>
        <div className="flex flex-col items-center mb-8">
          <div className="h-32 w-32 mb-4 relative group">
            <div className="h-32 w-32 rounded-full bg-orange-100 flex items-center justify-center">
              <UserIcon className="h-16 w-16 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{user.fullName}</div>
          <div className="text-base text-gray-500">ID: {user.id}</div>
        </div>
        {!editMode ? (
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
        ) : (
          <form className="w-full mt-4 bg-orange-50 rounded-2xl p-6 shadow-inner flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={uploading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                disabled={uploading}
              />
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
              disabled={uploading}
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
