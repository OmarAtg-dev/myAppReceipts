import PDFDropzone from "@/components/PDFDropzone";
import ReceiptList from "@/components/receiptList";

function Receipts() {
  return (
    <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <PDFDropzone />
        <ReceiptList />
      </div>
    </div>
  );
}
export default Receipts;