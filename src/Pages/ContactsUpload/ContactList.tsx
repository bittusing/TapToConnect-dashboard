import BulkMessage from "../../components/BulkMessage/BulkMessage";

export default function ContactList() {
  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="text-xl font-semibold text-dark dark:text-white sm:text-2xl mb-4">Send Bulk Message</h2>{" "}
        <BulkMessage type="none" mode="sms" showActionControl={false} />
      </div>
    </>
  );
}
