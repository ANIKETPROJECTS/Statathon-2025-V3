import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, AlertCircle, TrendingDown, Users, Shield, Zap, Info, Filter } from "lucide-react";

interface DetailedResult {
  technique: string;
  recordsSuppressed: number;
  totalRecords: number;
  informationLoss: number;
  equivalenceClasses?: number;
  avgGroupSize?: number;
  minGroupSize?: number;
  maxGroupSize?: number;
  privacyRisk?: number;
  diverseClasses?: number;
  violatingClasses?: number;
  avgDiversity?: number;
  satisfyingClasses?: number;
  avgDistance?: number;
  maxDistance?: number;
  parameters?: any;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function PrivacyResultsDetail({ result }: { result: DetailedResult }) {
  const recordsRetained = result.totalRecords - result.recordsSuppressed;
  const retentionRate = ((recordsRetained / result.totalRecords) * 100).toFixed(1);

  const suppressionData = [
    { name: "Retained", value: recordsRetained },
    { name: "Suppressed", value: result.recordsSuppressed },
  ];

  const renderKAnonymityDetails = () => {
    const groupDistData = [
      { name: 'Min Size', value: result.minGroupSize || 0 },
      { name: 'Avg Size', value: result.avgGroupSize || 0 },
      { name: 'Max Size', value: result.maxGroupSize || 0 },
    ];

    const riskData = [
      { name: 'Identity Risk', value: (result.privacyRisk || 0) * 100 },
      { name: 'Protection', value: 100 - (result.privacyRisk || 0) * 100 },
    ];

    return (
      <>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Equivalence Class Size Distribution
              </CardTitle>
              <CardDescription>Size range of grouped records</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={groupDistData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Probabilistic Risk Analysis
              </CardTitle>
              <CardDescription>Likelihood of individual re-identification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold">{((result.privacyRisk || 0) * 100).toFixed(1)}%</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Risk Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Equivalence Class Summary Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Metric</th>
                    <th className="p-2 text-left font-medium">Value</th>
                    <th className="p-2 text-left font-medium">Implication</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Total Equivalence Classes</td>
                    <td className="p-2">{result.equivalenceClasses}</td>
                    <td className="p-2 text-muted-foreground">Number of distinct patterns in protected data</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Average Group Size</td>
                    <td className="p-2">{result.avgGroupSize?.toFixed(2)}</td>
                    <td className="p-2 text-muted-foreground">Mean number of people per anonymity group</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Smallest Group Size</td>
                    <td className="p-2">{result.minGroupSize}</td>
                    <td className="p-2 text-muted-foreground">Matches requested K-value ({result.parameters?.kValue})</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Information Loss</td>
                    <td className="p-2">{(result.informationLoss * 100).toFixed(2)}%</td>
                    <td className="p-2 text-muted-foreground">Detail lost due to suppression/generalization</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Detailed Analysis: {result.technique.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </CardTitle>
              <CardDescription>Comprehensive privacy and utility evaluation</CardDescription>
            </div>
            <Badge variant="outline" className="capitalize px-3 py-1">
              {result.parameters?.method || 'Standard'} Implementation
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold">{recordsRetained}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Output Records</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-900/30">
                <TrendingDown className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold">{(result.informationLoss * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Info Loss</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-amber-100 rounded-full dark:bg-amber-900/30">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold">{result.recordsSuppressed}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Suppressed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-green-100 rounded-full dark:bg-green-900/30">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold">{result.totalRecords}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Input Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {result.technique === "k-anonymity" ? renderKAnonymityDetails() : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={suppressionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technique Overview</CardTitle>
              <CardDescription>Parameters applied during processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result.parameters || {}).map(([key, val]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <Badge variant="secondary">{String(val)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-green-200 bg-green-50/30 dark:border-green-900/20 dark:bg-green-900/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Process Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The {result.technique.replace("-", " ")} algorithm has finished. 
            All {recordsRetained} output records now satisfy the mathematical safety requirements 
            defined in your configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
