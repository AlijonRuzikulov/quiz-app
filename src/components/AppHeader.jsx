import { Brain } from "lucide-react";
import { BRAND } from "../config";

export default function AppHeader({ styles, onReset, isMobile }) {
  return (
    <header style={styles.header}>
      <div style={styles.brandWrap} onClick={onReset}>
        <img src="/logo.png" alt={`${BRAND.name} logo`} style={styles.logoImage} />
        <div>
          <div style={styles.brandTitle}>{BRAND.name}</div>
          <div style={styles.subtitle}>{BRAND.subtitle}</div>
        </div>
      </div>
      <div style={styles.logoBoxSmall}>
        <Brain size={isMobile ? 19 : 24} color={BRAND.navy} />
      </div>
    </header>
  );
}
