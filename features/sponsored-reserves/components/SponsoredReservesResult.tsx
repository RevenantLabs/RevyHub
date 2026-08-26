import { Card } from "@/core/ui/Card";
import { copy } from "@/features/sponsored-reserves/copy";
import type { SponsoredReservesResultData } from "@/features/sponsored-reserves/types";

export function SponsoredReservesResult({ data }: { data: SponsoredReservesResultData }) {
  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-lg font-medium mb-4">{copy.result.sponsoredByOthers}</h2>
        {data.sponsoredByOthers.length === 0 ? (
          <p className="text-sm text-gray-500">{copy.result.noneSponsored}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">{copy.result.typeColumn}</th>
                  <th className="px-4 py-2">{copy.result.detailsColumn}</th>
                  <th className="px-4 py-2">{copy.result.sponsorColumn}</th>
                </tr>
              </thead>
              <tbody>
                {data.sponsoredByOthers.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 capitalize">{item.type}</td>
                    <td className="px-4 py-2 font-mono">{item.details}</td>
                    <td className="px-4 py-2 font-mono break-all">{item.sponsor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-medium mb-4">{copy.result.sponsoringForOthers}</h2>
        {data.sponsoringForOthers.length === 0 ? (
          <p className="text-sm text-gray-500">{copy.result.noneSponsoring}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">{copy.result.typeColumn}</th>
                  <th className="px-4 py-2">{copy.result.detailsColumn}</th>
                  <th className="px-4 py-2">{copy.result.accountSponsoredColumn}</th>
                </tr>
              </thead>
              <tbody>
                {data.sponsoringForOthers.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 capitalize">{item.type}</td>
                    <td className="px-4 py-2 font-mono">{item.details}</td>
                    <td className="px-4 py-2 font-mono break-all">{item.accountSponsored}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
