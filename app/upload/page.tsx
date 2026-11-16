import UploadForm from "@/components/forms/UploadForm";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Submit a public facility</h1>
      <p className="text-slate-700">Submissions are saved as pending and reviewed by an administrator before appearing publicly. Do not include sensitive personal information.</p>
      <UploadForm />
    </div>
  );
}
