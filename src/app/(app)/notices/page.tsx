import { prisma } from "@/lib/db";
import { createNotice } from "@/lib/actions";
import { formatDate } from "@/lib/utils";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { FormModal, Field, PlusTrigger } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { author: true },
  });

  return (
    <div>
      <PageHeader title="공지사항" description="운영 공지 및 안내사항을 게시합니다.">
        <FormModal
          triggerLabel={<PlusTrigger label="공지 작성" />}
          title="공지 작성"
          action={createNotice}
          size="lg"
        >
          <div className="sm:col-span-2">
            <Field label="제목" required><input name="title" required className="input" /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="내용" required><textarea name="content" rows={5} required className="input" /></Field>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" name="pinned" className="h-4 w-4 rounded border-ink-300 text-brand-600" />
              상단 고정 (중요 공지)
            </label>
          </div>
        </FormModal>
      </PageHeader>

      <Card>
        {notices.length === 0 ? (
          <EmptyState title="등록된 공지가 없습니다." />
        ) : (
          <ul className="divide-y divide-ink-100">
            {notices.map((n) => (
              <li key={n.id} className="px-6 py-5 transition hover:bg-ink-50/40">
                <div className="flex items-center gap-2">
                  {n.pinned && (
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">중요</span>
                  )}
                  <h3 className="text-base font-semibold text-ink-900">{n.title}</h3>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{n.content}</p>
                <div className="mt-3 flex gap-2 text-xs text-ink-400">
                  <span>{n.author?.name ?? "시스템"}</span>
                  <span>·</span>
                  <span>{formatDate(n.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
