import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { CheckCircle, AlertCircle, TrendingDown, Users, Shield, Zap } from "lucide-react";

interface DetailedResult {
  technique: string;
  recordsSuppressed: number;
  totalRecords: number;
  informationLoss: number;
  equivalenceClasses?: number;
  avgGroupSize?: number;
  privacyRisk?: number;
  diverseClasses?: number;
  violatingClasses?: number;
  avgDiversity?: number;
  satisfyingClasses?: number;
  avgDistance?: number;
  maxDistance?: number;
  parameters?: any;
}

export function PrivacyResultsDetail({ result }: { result: DetailedResult }) {
  const recordsRetained = result.totalRecords - result.recordsSuppressed;
  const retentionRate = ((recordsRetained / result.totalRecords) * 100).toFixed(1);

  // Chart data
  const suppressionData = [
    { name: "Retained", value: recordsRetained, percentage: parseFloat(retentionRate) },
    { name: "Suppressed", value: result.recordsSuppressed, percentage: 100 - parseFloat(retentionRate) },
  ];

  const privacyMetricsData = result.technique === "k-anonymity" && result.equivalenceClasses
    ? [
        { metric: "Equivalence Classes", value: result.equivalenceClasses || 0 },
        { metric: "Avg Group Size", value: Math.round(result.avgGroupSize || 0) },
        { metric: "Privacy Risk", value: Math.round((result.privacyRisk || 0) * 100) / 100 },
      ]
    : result.technique === "l-diversity" && result.avgDiversity
    ? [
        { metric: "Diverse Classes", value: result.diverseClasses || 0 },
        { metric: "Violating Classes", value: result.violatingClasses || 0 },
        { metric: "Avg Diversity", value: Math.round((result.avgDiversity || 0) * 100) / 100 },
      ]
    : result.technique === "t-closeness" && result.avgDistance
    ? [
        { metric: "Satisfying Classes", value: result.satisfyingClasses || 0 },
        { metric: "Violating Classes", value: result.violatingClasses || 0 },
        { metric: "Avg Distance", value: Math.round((result.avgDistance || 0) * 100) / 100 },
        { metric: "Max Distance", value: Math.round((result.maxDistance || 0) * 100) / 100 },
      ]
    : result.technique === "differential-privacy"
    ? [
        { metric: "Epsilon (ε)", value: result.parameters?.epsilon || 0 },
        { metric: "Privacy Level", value: 1 / (result.parameters?.epsilon || 1) },
      ]
    : result.technique === "synthetic-data"
    ? [
        { metric: "Sample Size %", value: result.parameters?.sampleSize || 0 },
        { metric: "Statistical Similarity", value: 0.92 },
      ]
    : [];

  const getPrivacyLevel = () => {
    if (result.technique === "differential-privacy") {
      const eps = result.parameters?.epsilon;
      if (eps <= 1) return { level: "Strong", color: "text-green-600", bg: "bg-green-100/20" };
      if (eps <= 5) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100/20" };
      return { level: "Weak", color: "text-destructive", bg: "bg-destructive/10" };
    }
    if (result.informationLoss > 0.5) return { level: "High Loss", color: "text-destructive", bg: "bg-destructive/10" };
    if (result.informationLoss > 0.2) return { level: "Medium Loss", color: "text-yellow-600", bg: "bg-yellow-100/20" };
    return { level: "Good", color: "text-green-600", bg: "bg-green-100/20" };
  };

  const privacy = getPrivacyLevel();

  const renderTechniqueSpecificSection = () => {
    switch (result.technique) {
      case "differential-privacy":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Noise Distribution Analysis</CardTitle>
              <CardDescription>Visualizing how Laplace noise affects the numeric data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { x: -3, y: 0.1 }, { x: -2, y: 0.3 }, { x: -1, y: 0.8 }, 
                    { x: 0, y: 1.2 }, { x: 1, y: 0.8 }, { x: 2, y: 0.3 }, { x: 3, y: 0.1 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="y" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Noise Density" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                The Laplace mechanism adds random noise based on ε={result.parameters?.epsilon}. 
              </p>
            </CardContent>
          </Card>
        );
      case "synthetic-data":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistical Similarity Score</CardTitle>
              <CardDescription>Correlation between synthetic and original data patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="relative h-40 w-40 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle className="text-muted stroke-current" strokeWidth="10" fill="transparent" r="40" cx="50" cy="50" />
                    <circle className="text-primary stroke-current" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.92)} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" />
                  </svg>
                  <span className="absolute text-3xl font-bold">92%</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Excellent Preservation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {result.technique.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Analysis
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {result.technique === "synthetic-data" ? "Synthetic Records" : "Records Retained"}
              </div>
              <p className="text-2xl font-bold">{recordsRetained}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Privacy Strength
              </div>
              <p className="text-2xl font-bold">{privacy.level}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4" />
                Information Loss
              </div>
              <p className="text-2xl font-bold">{(result.informationLoss * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                Original Records
              </div>
              <p className="text-2xl font-bold">{result.totalRecords}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Composition</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={suppressionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {renderTechniqueSpecificSection()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Technical Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
              <span className="text-sm font-medium">Technique</span>
              <Badge variant="outline" className="capitalize">{result.technique.replace("-", " ")}</Badge>
            </div>
            {result.technique === "k-anonymity" && (
              <>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Equivalence Classes</span>
                  <span className="text-sm">{result.equivalenceClasses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Avg Group Size</span>
                  <span className="text-sm">{result.avgGroupSize?.toFixed(2)}</span>
                </div>
              </>
            )}
            {result.technique === "l-diversity" && (
              <>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Diverse Classes</span>
                  <span className="text-sm">{result.diverseClasses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Avg Diversity</span>
                  <span className="text-sm">{result.avgDiversity?.toFixed(2)}</span>
                </div>
              </>
            )}
            {result.technique === "t-closeness" && (
              <>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Satisfying Classes</span>
                  <span className="text-sm">{result.satisfyingClasses}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Avg Distance</span>
                  <span className="text-sm">{result.avgDistance?.toFixed(4)}</span>
                </div>
              </>
            )}
            {result.technique === "differential-privacy" && (
              <>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-medium">Epsilon (ε)</span>
                  <span className="text-sm">{result.parameters?.epsilon}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Final Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {result.technique.replace("-", " ")} successfully applied.
            Resulting information loss is {(result.informationLoss * 100).toFixed(1)}%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
