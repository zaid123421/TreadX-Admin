import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/ui/breadcrumb';

export function WarehouseFormPageShell({ title, description, children }) {
  return (
    <div className="min-h-full bg-background px-4 py-8 pb-16 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          <BreadcrumbItem>
            <span className="text-muted-foreground">WMS</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/warehouses" className="text-muted-foreground hover:text-foreground">
                Warehouses
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      {description && (
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
