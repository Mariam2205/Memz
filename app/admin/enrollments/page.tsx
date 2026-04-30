<p>Payer Name: {item.payer_name || "-"}</p>
<p>Sender Wallet: {item.wallet_number || "-"}</p>
<p>
  Transfer Time:{" "}
  {item.transfer_time
    ? new Date(item.transfer_time).toLocaleString()
    : "-"}
</p>

{item.payment_screenshot_url ? (
  <a
    href={item.payment_screenshot_url}
    target="_blank"
    className="font-semibold text-[var(--memz-primary)]"
  >
    View Payment Screenshot
  </a>
) : (
  <p>No screenshot uploaded</p>
)}