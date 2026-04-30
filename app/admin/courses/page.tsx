"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import SearchBar from "@/components/SearchBar";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { slugify } from "@/lib/slugify";

type Course = {
  id: string;
  title?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  description_html?: string | null;
  display_title?: string;
  display_description?: string;
  subject_id?: string | null;
  level_id?: string | null;
  price?: number | null;
is_free?: boolean | null;
pricing_type?: string | null;
level_description?: string | null;
age_category?: string | null;
course_objectives?: string | null;
starting_date?: string | null;
};

type Subject = {
  id: string;
  title?: string | null;
  name?: string | null;
};

type Level = {
  id: string;
  title?: string | null;
  name?: string | null;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [title, setTitle] = useState("");
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [price, setPrice] = useState("0");
const [isFree, setIsFree] = useState(true);
const [pricingType, setPricingType] = useState("course");
const [levelDescription, setLevelDescription] = useState("");
const [ageCategory, setAgeCategory] = useState("");
const [courseObjectives, setCourseObjectives] = useState("");
const [startingDate, setStartingDate] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const slug = useMemo(() => slugify(title), [title]);

  const plainDescription = useMemo(() => {
    return descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }, [descriptionHtml]);

  useEffect(() => {
    fetchCourses();
    fetchMeta();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/courses");
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load courses");
        return;
      }

      setCourses(data.courses || []);
    } catch {
      setMessage("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMeta() {
    try {
      const [subjectsRes, levelsRes] = await Promise.all([
        fetch("/api/admin/subjects"),
        fetch("/api/admin/levels"),
      ]);

      const subjectsData = await subjectsRes.json();
      const levelsData = await levelsRes.json();

      if (subjectsRes.ok) setSubjects(subjectsData.subjects || []);
      if (levelsRes.ok) setLevels(levelsData.levels || []);
    } catch {
      setMessage("Failed to load subjects or levels");
    }
  }

  function startEdit(course: Course) {
    setEditingId(course.id);
    setTitle(course.title || course.name || "");
    setDescriptionHtml(course.description_html || course.description || "");
    setSubjectId(course.subject_id || "");
    setLevelId(course.level_id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId("");
    setTitle("");
    setDescriptionHtml("");
    setSubjectId("");
    setLevelId("");
    setPrice("0");
setIsFree(true);
setPricingType("course");
setLevelDescription("");
setAgeCategory("");
setCourseObjectives("");
setStartingDate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const method = editingId ? "PATCH" : "POST";

      const body = {
        id: editingId || undefined,
        title,
        name: title,
        slug,
        plainDescription,
        descriptionHtml,
        subject_id: subjectId || null,
        level_id: levelId || null,
        price: isFree ? 0 : Number(price || 0),
is_free: isFree,
pricing_type: pricingType,
level_description: levelDescription,
age_category: ageCategory,
course_objectives: courseObjectives,
starting_date: startingDate || null,
      };

      const res = await fetch("/api/admin/courses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save course");
        return;
      }

      setMessage(editingId ? "Course updated successfully" : "Course created successfully");
      resetForm();
      fetchCourses();
    } catch {
      setMessage("Failed to save course");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this course?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to delete course");
        return;
      }

      setMessage("Course deleted successfully");
      if (editingId === id) resetForm();
      fetchCourses();
    } catch {
      setMessage("Failed to delete course");
    }
  }

  const subjectMap = useMemo(
    () => new Map(subjects.map((item) => [item.id, item])),
    [subjects]
  );

  const levelMap = useMemo(
    () => new Map(levels.map((item) => [item.id, item])),
    [levels]
  );

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return courses;

    return courses.filter((course) => {
      const titleText = (course.title || course.name || "").toLowerCase();
      const descText = (
        course.description || course.description_html || ""
      ).toLowerCase();
      return titleText.includes(q) || descText.includes(q);
    });
  }, [courses, search]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[var(--memz-page-bg)] px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-[var(--memz-text)]">Courses</h1>
            <p className="mt-2 text-[var(--memz-muted)]">
              Create, edit, and delete courses.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm space-y-4"
          >
            <h2 className="text-xl font-semibold text-[var(--memz-text)]">
              {editingId ? "Edit Course" : "Add Course"}
            </h2>

            <input
              type="text"
              placeholder="Course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
            />

            <input
              type="text"
              value={slug}
              readOnly
              className="w-full rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] px-4 py-3 outline-none"
            />

            <RichTextEditor
              label="Course description"
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="Add a formatted course description..."
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
              >
                <option value="">Select Subject (optional)</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.title || subject.name || "Untitled Subject"}
                  </option>
                ))}
              </select>
<div className="grid gap-4 md:grid-cols-2">
  <select
    value={subjectId}
    onChange={(e) => setSubjectId(e.target.value)}
    className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
  >
    <option value="">Select Subject (optional)</option>
    {subjects.map((subject) => (
      <option key={subject.id} value={subject.id}>
        {subject.title || subject.name || "Untitled Subject"}
      </option>
    ))}
  </select>

  <select
    value={levelId}
    onChange={(e) => setLevelId(e.target.value)}
    className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
  >
    <option value="">Select Level (optional)</option>
    {levels.map((level) => (
      <option key={level.id} value={level.id}>
        {level.title || level.name || "Untitled Level"}
      </option>
    ))}
  </select>
</div>

<div className="grid gap-4 sm:grid-cols-2">
  <label className="flex items-center gap-3 rounded-2xl border border-[var(--memz-border)] px-4 py-3">
    <input
      type="checkbox"
      checked={isFree}
      onChange={(e) => setIsFree(e.target.checked)}
    />
    <span className="text-sm font-semibold">Free course</span>
  </label>

  <select
    value={pricingType}
    onChange={(e) => setPricingType(e.target.value)}
    className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
  >
    <option value="course">By Course</option>
    <option value="level">By Level</option>
    <option value="month">Monthly</option>
  </select>
</div>

{!isFree ? (
  <input
    type="number"
    min="0"
    step="0.01"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    placeholder="Course price"
    className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
  />
) : null}

<input
  value={ageCategory}
  onChange={(e) => setAgeCategory(e.target.value)}
  placeholder="Age Category e.g. 8-12 years"
  className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
/>

<input
  type="date"
  value={startingDate}
  onChange={(e) => setStartingDate(e.target.value)}
  className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
/>

<RichTextEditor
  label="Level Description"
  value={levelDescription}
  onChange={setLevelDescription}
  placeholder="Write the level description..."
/>

<RichTextEditor
  label="Course Objectives"
  value={courseObjectives}
  onChange={setCourseObjectives}
  placeholder="Write course objectives..."
/>

{!isFree ? (
  <input
    type="number"
    min="0"
    step="0.01"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
    placeholder="Course price"
    className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
  />
) : null}

<input
  value={ageCategory}
  onChange={(e) => setAgeCategory(e.target.value)}
  placeholder="Age Category e.g. 8-12 years"
  className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
/>

<input
  type="date"
  value={startingDate}
  onChange={(e) => setStartingDate(e.target.value)}
  className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
/>

<textarea
  value={levelDescription}
  onChange={(e) => setLevelDescription(e.target.value)}
  placeholder="Level Description"
  className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
/>

<textarea
  value={courseObjectives}
  onChange={(e) => setCourseObjectives(e.target.value)}
  placeholder="Course Objectives"
  className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
/>
              <select
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
                className="w-full rounded-2xl border border-[var(--memz-border)] px-4 py-3 outline-none"
              >
                <option value="">Select Level (optional)</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.title || level.name || "Untitled Level"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[var(--memz-primary)] px-5 py-3 font-semibold text-white"
              >
                {saving ? "Saving..." : editingId ? "Update Course" : "Create Course"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-[var(--memz-border)] px-5 py-3 font-semibold text-[var(--memz-text)]"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            {message ? (
              <p className="text-sm font-medium text-[var(--memz-primary)]">{message}</p>
            ) : null}
          </form>

          <div className="rounded-3xl border border-[var(--memz-border)] bg-white p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[var(--memz-text)]">Existing Courses</h2>
              <div className="w-full max-w-sm">
                <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." />
              </div>
            </div>

            {loading ? (
              <p className="text-[var(--memz-muted)]">Loading courses...</p>
            ) : filteredCourses.length === 0 ? (
              <p className="text-[var(--memz-muted)]">No courses found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredCourses.map((course) => {
                  const subject = course.subject_id ? subjectMap.get(course.subject_id) : null;
                  const level = course.level_id ? levelMap.get(course.level_id) : null;

                  return (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-[var(--memz-border)] bg-[var(--memz-soft)] p-5"
                    >
                      <Link href={`/courses/${course.id}`}>
                        <h3 className="font-semibold text-[var(--memz-text)]">
                          {course.display_title || course.title || course.name || "Untitled Course"}
                        </h3>
                      </Link>

                      <div
                        className="prose prose-sm mt-3 max-w-none text-[var(--memz-muted)]"
                        dangerouslySetInnerHTML={{
                          __html:
                            course.display_description ||
                            course.description_html ||
                            course.description ||
                            "<p>No description yet.</p>",
                        }}
                      />
{course.level_description ? (
  <div
    className="prose prose-sm mt-3 max-w-none text-[var(--memz-muted)]"
    dangerouslySetInnerHTML={{ __html: course.level_description }}
  />
) : null}

{course.course_objectives ? (
  <div
    className="prose prose-sm mt-3 max-w-none text-[var(--memz-muted)]"
    dangerouslySetInnerHTML={{ __html: course.course_objectives }}
  />
) : null}
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-white px-3 py-1">
                          {subject?.title || subject?.name || "No Subject"}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          {level?.title || level?.name || "No Level"}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => startEdit(course)}
                          className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--memz-primary)]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(course.id)}
                          className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}