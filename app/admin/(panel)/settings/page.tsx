import { ContentEditor } from "@/components/admin/content-editor";
import { Sweep } from "@/components/admin/sweep";
export const metadata = { title: "Settings" };
export default function Page() { return <ContentEditor name="settings" title="Website Settings" text="Business details appear on the site only when filled in. Leave anything unconfirmed blank." extra={<Sweep />} />; }
