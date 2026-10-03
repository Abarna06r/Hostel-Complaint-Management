import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileImage,
  X,
  Building,
  MapPin,
} from 'lucide-react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import complaintService from '../../services/complaintService';
import categoryService from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SubmitComplaintPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'Medium',
    location: '',
    hostel: user?.hostel || 'Aryabhatta Hall',
    block: user?.block || 'A Block',
    roomNumber: user?.roomNumber || '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Load active categories from backend
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await categoryService.getCategories();
        if (res.success && res.categories) {
          setCategories(res.categories);
          if (res.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category: res.categories[0].name }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('File size cannot exceed 5MB');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!formData.title.trim()) return setErrorMsg('Please provide a complaint title');
    if (!formData.category) return setErrorMsg('Please select a category');
    if (!formData.description.trim()) return setErrorMsg('Please provide an issue description');
    if (!formData.location.trim()) return setErrorMsg('Please specify exact location within hostel');
    if (!formData.roomNumber.trim()) return setErrorMsg('Please provide your room number');

    try {
      setSubmitting(true);

      // Create FormData if file is attached, or regular JSON
      let payload;
      if (selectedFile) {
        payload = new FormData();
        Object.keys(formData).forEach((key) => {
          payload.append(key, formData[key]);
        });
        payload.append('attachment', selectedFile);
      } else {
        payload = formData;
      }

      const res = await complaintService.createComplaint(payload);

      if (res.success && res.complaint) {
        success(`Complaint registered! Ticket ID: ${res.complaint.complaintId}`);
        navigate(`/student/complaints/${res.complaint._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint. Please retry.';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Submit Maintenance Complaint
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide complete details of the issue so the hostel warden and technicians can resolve it quickly.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title and Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Complaint Title"
                name="title"
                placeholder="e.g. Geyser tripping circuit breaker in washroom"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
                placeholder={loadingCategories ? 'Loading categories...' : 'Select Category'}
                required
              />
            </div>
          </div>

          {/* Row 2: Priority and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Select
                label="Urgency / Priority Level"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: 'Low', label: 'Low - Minor convenience issue' },
                  { value: 'Medium', label: 'Medium - Standard repair needed' },
                  { value: 'High', label: 'High - Severely affecting daily living' },
                  { value: 'Urgent', label: 'Urgent - Safety hazard / Water burst / Electrical fire hazard' },
                ]}
                required
              />
            </div>
            <div>
              <Input
                label="Specific Location"
                name="location"
                placeholder="e.g. Room 302 Desk / 2nd Floor Corridor"
                value={formData.location}
                onChange={handleChange}
                icon={MapPin}
                required
              />
            </div>
          </div>

          {/* Row 3: Hostel, Block, Room Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <Input
                label="Hostel Name"
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                icon={Building}
                required
              />
            </div>
            <div>
              <Input
                label="Block / Wing"
                name="block"
                value={formData.block}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                label="Room Number"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Detailed Problem Description"
              name="description"
              rows={5}
              placeholder="Describe what is broken, when it started happening, and any specific observations (e.g. leaking from the valve joint, spark from switch)..."
              value={formData.description}
              onChange={handleChange}
              maxLength={1500}
              required
            />
          </div>

          {/* File Attachment (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Photo Attachment (Optional)
            </label>
            <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 text-xs font-semibold text-slate-700 transition">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Choose Image (JPG, PNG up to 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  <FileImage className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:text-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {filePreview && (
              <div className="mt-3 relative inline-block">
                <img
                  src={filePreview}
                  alt="Attachment Preview"
                  className="w-32 h-24 object-cover rounded-xl border border-slate-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/student/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={Send}
              className="px-6"
            >
              Submit Complaint
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaintPage;
