'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Lesson {
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
}

interface Module {
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Batch {
  name: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  isActive: boolean;
}

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  discountedPrice: number;
  tags: string[];
  modules: Module[];
  batches: Batch[];
  status: 'draft' | 'published' | 'archived';
}

const initialFormData: CourseFormData = {
  title: '',
  slug: '',
  description: '',
  shortDescription: '',
  thumbnail: '',
  category: '',
  level: 'Beginner',
  price: 0,
  discountedPrice: 0,
  tags: [],
  modules: [],
  batches: [],
  status: 'draft',
};

const categories = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'UI/UX Design',
  'Digital Marketing',
  'Business',
  'Other',
];

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'modules' | 'batches'>('basic');

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'discountedPrice' ? Number(value) : value,
      ...(name === 'title' ? { slug: generateSlug(value) } : {}),
    }));
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Module management
  const addModule = () => {
    const newModule: Module = {
      title: `Module ${formData.modules.length + 1}`,
      description: '',
      order: formData.modules.length + 1,
      lessons: [],
    };
    setFormData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
  };

  const updateModule = (index: number, field: keyof Module, value: string | number) => {
    const updated = [...formData.modules];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, modules: updated }));
  };

  const removeModule = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  // Lesson management
  const addLesson = (moduleIndex: number) => {
    const updated = [...formData.modules];
    const newLesson: Lesson = {
      title: `Lesson ${updated[moduleIndex].lessons.length + 1}`,
      description: '',
      content: '',
      videoUrl: '',
      duration: 0,
      order: updated[moduleIndex].lessons.length + 1,
      isFree: false,
    };
    updated[moduleIndex].lessons.push(newLesson);
    setFormData((prev) => ({ ...prev, modules: updated }));
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: string | number | boolean
  ) => {
    const updated = [...formData.modules];
    updated[moduleIndex].lessons[lessonIndex] = {
      ...updated[moduleIndex].lessons[lessonIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, modules: updated }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updated = [...formData.modules];
    updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setFormData((prev) => ({ ...prev, modules: updated }));
  };

  // Batch management
  const addBatch = () => {
    const newBatch: Batch = {
      name: `Batch ${formData.batches.length + 1}`,
      startDate: '',
      endDate: '',
      maxStudents: 30,
      isActive: true,
    };
    setFormData((prev) => ({
      ...prev,
      batches: [...prev.batches, newBatch],
    }));
  };

  const updateBatch = (index: number, field: keyof Batch, value: string | number | boolean) => {
    const updated = [...formData.batches];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, batches: updated }));
  };

  const removeBatch = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      batches: prev.batches.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert status to isPublished for the backend
      const { status, discountedPrice, ...rest } = formData;
      const courseData = {
        ...rest,
        discountPrice: discountedPrice,
        isPublished: status === 'published',
        isFeatured: false,
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      toast.success('Course created successfully!');
      router.push('/admin/dashboard/courses');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/courses"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600">Add a new course with modules, lessons, and batches</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['basic', 'modules', 'batches'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'basic' ? 'Basic Info' : tab}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleBasicChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Complete Web Development Bootcamp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (auto-generated)
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleBasicChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description *
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleBasicChange}
                  required
                  maxLength={200}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief course overview (max 200 characters)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleBasicChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed course description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleBasicChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleBasicChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleBasicChange}
                  required
                  min={0}
                  step={0.01}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discounted Price ($)
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleBasicChange}
                  min={0}
                  step={0.01}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            {formData.modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">Module {moduleIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeModule(moduleIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={module.order}
                      onChange={(e) => updateModule(moduleIndex, 'order', Number(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={module.description}
                      onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Lessons */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Lessons</h4>
                  <div className="space-y-3">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-gray-600">
                            Lesson {lessonIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)
                            }
                            placeholder="Lesson title"
                            className="px-3 py-2 border rounded-lg text-sm"
                          />
                          <input
                            type="url"
                            value={lesson.videoUrl}
                            onChange={(e) =>
                              updateLesson(moduleIndex, lessonIndex, 'videoUrl', e.target.value)
                            }
                            placeholder="Video URL (YouTube/Vimeo)"
                            className="px-3 py-2 border rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            value={lesson.duration}
                            onChange={(e) =>
                              updateLesson(
                                moduleIndex,
                                lessonIndex,
                                'duration',
                                Number(e.target.value)
                              )
                            }
                            placeholder="Duration (minutes)"
                            className="px-3 py-2 border rounded-lg text-sm"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={lesson.isFree}
                              onChange={(e) =>
                                updateLesson(moduleIndex, lessonIndex, 'isFree', e.target.checked)
                              }
                              className="w-4 h-4"
                            />
                            <label className="text-sm text-gray-600">Free preview</label>
                          </div>
                          <textarea
                            value={lesson.description}
                            onChange={(e) =>
                              updateLesson(moduleIndex, lessonIndex, 'description', e.target.value)
                            }
                            placeholder="Lesson description"
                            className="md:col-span-2 px-3 py-2 border rounded-lg text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addLesson(moduleIndex)}
                    className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Lesson
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addModule}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Module
            </button>
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            {formData.batches.map((batch, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">Batch {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeBatch(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Name *
                    </label>
                    <input
                      type="text"
                      value={batch.name}
                      onChange={(e) => updateBatch(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., January 2025 Cohort"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={batch.startDate}
                      onChange={(e) => updateBatch(index, 'startDate', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={batch.endDate}
                      onChange={(e) => updateBatch(index, 'endDate', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Students
                    </label>
                    <input
                      type="number"
                      value={batch.maxStudents}
                      onChange={(e) => updateBatch(index, 'maxStudents', Number(e.target.value))}
                      min={1}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      checked={batch.isActive}
                      onChange={(e) => updateBatch(index, 'isActive', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-gray-600">Active (open for enrollment)</label>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addBatch}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Batch
            </button>

            {formData.batches.length === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Tip:</strong> Batches allow you to run the same course multiple times with
                different start dates. Students enroll in a specific batch, which helps manage
                cohorts and track progress.
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/dashboard/courses"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
