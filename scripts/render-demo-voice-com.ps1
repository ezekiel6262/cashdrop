$ErrorActionPreference = 'Stop'
$outDir = Join-Path $PSScriptRoot '..\video-work\audio'
New-Item -ItemType Directory -Force $outDir | Out-Null
$segments = @(
  "This is CashDrop version three: private Zcash payments, delivered as a link. The new interface turns a difficult shielded transaction into a product anyone can understand, with no account, browser extension, or public payment graph.",
  "Zcash is essential. On a transparent chain, a payment link can expose the sender, recipient, amount, and future activity. CashDrop keeps both funding and claiming inside the shielded pool, so privacy is architecture, not decoration.",
  "To send, choose CashDrop, enter an amount and private note, and optionally add a password. A password keeps the decryption key out of the link. The browser creates a fresh testnet seed and shielded address locally.",
  "Fund the displayed address with the amount plus the small claim fee reserve. Save the recovery file, then share the encrypted claim link privately. CashDrop never receives the seed, amount, note, password, or recipient destination.",
  "The recipient opens the link, unlocks it when required, and enters any shielded testnet address. If they have no wallet, CashDrop creates one in the browser. Web Z J S scans, proves, and broadcasts the shielded claim locally.",
  "The new Checkout mode creates an exact-price point-of-sale request and QR code. The merchant imports their recovery file to verify the real testnet transaction locally, seeing confirmed, pending, underpaid, or not found without creating a customer database.",
  "Plans adds customer-approved weekly, monthly, or yearly renewals without permanent debit authority. Drop Batch supports rewards and payroll, Private Fund raises without a donor graph, and recovery lets senders reclaim an unspent envelope.",
  "CashDrop is open source, non-custodial, and live at cashdrop dot live. It uses Web Z J S, librustzcash WebAssembly, A E S encryption, and real Zcash testnet operations. Private money can now be waiting before the wallet exists."
)
for ($i = 0; $i -lt $segments.Count; $i++) {
  $voice = New-Object -ComObject SAPI.SpVoice
  $voice.Rate = 3
  $stream = New-Object -ComObject SAPI.SpFileStream
  $file = Join-Path $outDir ("segment-{0:D2}.wav" -f ($i + 1))
  $stream.Open($file, 3, $false)
  $voice.AudioOutputStream = $stream
  [void]$voice.Speak($segments[$i])
  $stream.Close()
  [Runtime.InteropServices.Marshal]::ReleaseComObject($stream) | Out-Null
  [Runtime.InteropServices.Marshal]::ReleaseComObject($voice) | Out-Null
}
Write-Output "Rendered $($segments.Count) narration segments."
