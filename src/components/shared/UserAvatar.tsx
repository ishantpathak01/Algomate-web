export default function UserAvatar({
  name,
  pictureUrl,
}: {
  name: string;
  pictureUrl?: string;
}) {
  return pictureUrl ? (
    // The URL is provided by the profile service; use a regular image until the image host is configured.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={pictureUrl} alt="" className="size-10 rounded-full object-cover" />
  ) : (
    <span
      aria-label={name}
      className="grid size-10 place-items-center rounded-full bg-brand/20 text-sm font-semibold text-brand-soft"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
