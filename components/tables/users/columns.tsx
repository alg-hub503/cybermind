"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import Button from "@/components/ui/button";

import RoleButton from "@/components/RoleButton";
import SubscriptionButton from "@/components/SubscriptionButton";
import DeleteUserButton from "@/app/dashboard/users/DeleteUserButton";

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionStatus: string;
}

export const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),

    cell: ({ row }) => row.original.name ?? "-",
  },

  {
    accessorKey: "role",

    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },

  {
    accessorKey: "subscriptionStatus",

    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(
            column.getIsSorted() === "asc"
          )
        }
      >
        Subscription
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },

  {
    id: "actions",

    header: "Actions",

    cell: ({ row }) => (
      <div className="flex flex-wrap gap-2">
        <SubscriptionButton
          userId={row.original.id}
          subscriptionStatus={
            row.original.subscriptionStatus
          }
        />

        <RoleButton
          userId={row.original.id}
          role={row.original.role}
        />

        <DeleteUserButton
          id={row.original.id}
        />
      </div>
    ),
  },
];
