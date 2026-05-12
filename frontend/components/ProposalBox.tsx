/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ProposalBox.tsx

export default function ProposalBox({ proposal }: any) {
  return (
    <div className="p-4 border rounded-xl mt-4 bg-gray-50">
      <h3 className="font-semibold mb-2">AI Proposal</h3>
      <p>{proposal}</p>
    </div>
  );
}
