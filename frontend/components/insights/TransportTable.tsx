import React from 'react';
import { Table, TableHeader, TableBody } from "../ui/table";
import { formatDuration } from "../../utils/duration";

interface TransportRoute {
  route: string;
  mode: string;
  duration: string | number;
  price: string;
}

interface TransportTableProps {
  routes: TransportRoute[];
}

export const TransportTable: React.FC<TransportTableProps> = ({ routes }) => {
  return (
    <Table>
      <TableHeader>
        <tr>
          <th className="text-left">Route</th>
          <th className="text-left">Mode</th>
          <th className="text-left">Duration</th>
          <th className="text-left">Price</th>
        </tr>
      </TableHeader>
      <TableBody>
        {routes.map((route, index) => (
          <tr key={index}>
            <td>{route.route}</td>
            <td>{route.mode}</td>
            <td>{formatDuration(route.duration)}</td>
            <td>{route.price}</td>
          </tr>
        ))}
      </TableBody>
    </Table>
  );
};