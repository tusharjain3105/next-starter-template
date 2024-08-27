import { Card, CardContent, CardTitle } from "@/components/ui/card";
import ThemeToggler from "@/components/ui/ThemeToggler";

export default function Home() {
  return (
    <main className="grid h-full place-items-center">
      <Card className="shadow">
        <CardContent className="grid place-items-center p-10">
          <div className="flex items-center justify-between gap-48">
            <CardTitle>Hello Word</CardTitle>
            <ThemeToggler />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
