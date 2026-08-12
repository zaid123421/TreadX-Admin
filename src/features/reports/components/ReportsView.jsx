import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

function dealerLabel(dealer) {
  return (
    dealer?.businessName ||
    dealer?.companyName ||
    dealer?.name ||
    (dealer?.id != null ? `Dealer #${dealer.id}` : 'Dealer')
  );
}

function warehouseLabel(warehouse) {
  return (
    warehouse?.warehouseName ||
    warehouse?.name ||
    (warehouse?.id != null ? `Warehouse #${warehouse.id}` : 'Warehouse')
  );
}

export function ReportsView({
  categories,
  dealers,
  warehouses,
  dealersLoading,
  warehousesLoading,
  dealerId,
  setDealerId,
  warehouseId,
  setWarehouseId,
  exportingKey,
  handleExport,
}) {
  const { t } = useTranslation('reports');

  return (
    <div className="min-h-full bg-background px-4 py-8 pb-16 lg:px-8">
      <div>
        <p className="text-sm text-muted-foreground">{t('breadcrumb')}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t('description')}</p>
      </div>

      <div className="mt-8 space-y-8">
        {categories.map(({ categoryKey, reports }) => {
          const isWarehouseCategory = categoryKey === 'platformWarehouse';

          return (
            <section key={categoryKey} className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {t(`categories.${categoryKey}`)}
                </h2>

                {isWarehouseCategory && (
                  <Select
                    value={warehouseId || undefined}
                    onValueChange={setWarehouseId}
                    disabled={warehousesLoading || warehouses.length === 0}
                  >
                    <SelectTrigger className="w-full sm:w-72">
                      <SelectValue
                        placeholder={
                          warehousesLoading
                            ? t('loadingWarehouses')
                            : warehouses.length === 0
                              ? t('noWarehouses')
                              : t('selectWarehouse')
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                          {warehouseLabel(warehouse)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {isWarehouseCategory && (
                <p className="text-sm text-muted-foreground">{t('warehouseRequiredHint')}</p>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {reports.map((report) => {
                  const excelKey = `${report.id}-excel`;
                  const pdfKey = `${report.id}-pdf`;
                  const busy = exportingKey === excelKey || exportingKey === pdfKey;
                  const needsDealer = report.requiresDealer;
                  const needsWarehouse = report.requiresWarehouse;
                  const canExport =
                    (!needsDealer || Boolean(dealerId)) &&
                    (!needsWarehouse || Boolean(warehouseId));

                  return (
                    <Card key={report.id} className="border-border bg-card shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t(`items.${report.nameKey}`)}</CardTitle>
                        <CardDescription>
                          {needsDealer
                            ? t('dealerRequiredHint')
                            : needsWarehouse
                              ? t('warehouseExportHint')
                              : t('exportHint')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {needsDealer && (
                          <Select
                            value={dealerId || undefined}
                            onValueChange={setDealerId}
                            disabled={dealersLoading || dealers.length === 0}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  dealersLoading
                                    ? t('loadingDealers')
                                    : dealers.length === 0
                                      ? t('noDealers')
                                      : t('selectDealer')
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {dealers.map((dealer) => (
                                <SelectItem key={dealer.id} value={String(dealer.id)}>
                                  {dealerLabel(dealer)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!canExport || busy}
                            onClick={() => handleExport(report, 'excel')}
                          >
                            {exportingKey === excelKey ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                            )}
                            {t('exportExcel')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!canExport || busy}
                            onClick={() => handleExport(report, 'pdf')}
                          >
                            {exportingKey === pdfKey ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="mr-2 h-4 w-4" />
                            )}
                            {t('exportPdf')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
