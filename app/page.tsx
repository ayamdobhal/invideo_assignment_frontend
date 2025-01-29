import { Calculator } from "./components/Calculator";

export default function Home() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-4">
        <Calculator />
      </div>
    </div>
  );
}
