import React, { useEffect, useRef, useState, useCallback } from 'react';
import Model from '@phelian/react-body-highlighter';
import { BodyRegion } from './BodyHeatmap';

interface BodyPartCutoutProps {
  region: BodyRegion | null;
  gender?: 'male' | 'female';
  preferredView?: 'anterior' | 'posterior';
}

const POSTERIOR_REGIONS = new Set<BodyRegion>([
  'upper-back', 'lower-back', 'trapezius', 'hamstring', 'gluteal', 'back-deltoids', 'calves'
]);

const PADDING = 20;
const RETRY_DELAYS = [200, 500, 900, 1500, 2500];

const BodyPartCutout: React.FC<BodyPartCutoutProps> = ({
  region,
  gender = 'male',
  preferredView,
}) => {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [cutout, setCutout] = useState<{
    paths: { d: string; fill: string; opacity: string }[];
    viewBox: string;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  const view: 'anterior' | 'posterior' =
    preferredView ?? (region && POSTERIOR_REGIONS.has(region) ? 'posterior' : 'anterior');

  const getAliases = (r: BodyRegion): string[] => {
    const map: Partial<Record<BodyRegion, string[]>> = {
      head:             ['head'],
      neck:             ['neck'],
      trapezius:        ['trapezius'],
      chest:            ['chest', 'pectoralis'],
      abs:              ['abs', 'abdominals', 'rectus-abdominis', 'rectus'],
      obliques:         ['obliques'],
      'front-deltoids': ['front-deltoids', 'deltoids', 'anterior-deltoid', 'deltoid'],
      'back-deltoids':  ['back-deltoids', 'deltoids', 'posterior-deltoid', 'deltoid'],
      biceps:           ['biceps'],
      triceps:          ['triceps'],
      forearm:          ['forearm', 'forearms'],
      'upper-back':     ['upper-back', 'rhomboids', 'teres', 'upper_back'],
      'lower-back':     ['lower-back', 'erector', 'lower_back'],
      adductor:         ['adductor', 'adductors', 'inner-thigh'],
      abductors:        ['abductors'],
      quadriceps:       ['quadriceps', 'quads', 'quad'],
      hamstring:        ['hamstring', 'hamstrings'],
      calves:           ['calves', 'gastrocnemius', 'soleus', 'calf'],
      gluteal:          ['gluteal', 'glutes', 'gluteus'],
    };
    return map[r] ?? [r];
  };

  const extractCutout = useCallback((): boolean => {
    if (!region || !hiddenRef.current) return false;

    const svg = hiddenRef.current.querySelector('svg');
    if (!svg) return false;

    const aliases = getAliases(region).map(a => a.toLowerCase());
    const allShapes = Array.from(svg.querySelectorAll('path, ellipse, circle, rect, polygon'));

    // --- Strategy 1: attribute / label matching ---
    const byAttribute: SVGGraphicsElement[] = [];
    allShapes.forEach(el => {
      let node: Element | null = el;
      while (node && node !== svg) {
        const id     = (node.getAttribute('id') ?? '').toLowerCase();
        const cls    = (node.getAttribute('class') ?? '').toLowerCase();
        const label  = (node.getAttribute('aria-label') ?? '').toLowerCase();
        const dataId = (node.getAttribute('data-testid') ?? '').toLowerCase();
        const title  = node.querySelector(':scope > title')?.textContent?.toLowerCase() ?? '';
        const name   = (node.getAttribute('name') ?? '').toLowerCase();

        if (aliases.some(a =>
          id.includes(a) || cls.includes(a) || label.includes(a) ||
          title.includes(a) || dataId.includes(a) || name.includes(a)
        )) {
          byAttribute.push(el as SVGGraphicsElement);
          break;
        }
        node = node.parentElement;
      }
    });

    // --- Strategy 2: non-default fill attribute ---
    // The library sets fill on highlighted paths to a non-gray/white color
    const defaultFillPattern = /^(none|#(b2b2b2|d3d3d3|c0c0c0|e0e0e0|f0f0f0|fff|ffffff|ebebeb|e8e8e8|cccccc|aaaaaa|999999|888888))$/i;
    const byFillAttr: SVGGraphicsElement[] = [];
    allShapes.forEach(el => {
      const fill = (el.getAttribute('fill') ?? '').trim();
      if (fill && !defaultFillPattern.test(fill)) {
        byFillAttr.push(el as SVGGraphicsElement);
      }
    });

    // --- Strategy 3: computed style — warm/red highlight color ---
    const byComputedFill: SVGGraphicsElement[] = [];
    allShapes.forEach(el => {
      const computed = window.getComputedStyle(el).fill ?? '';
      const match = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1]), g = parseInt(match[2]);
        // Red/orange hues: high red channel, low green channel
        if (r > 150 && g < 120) {
          byComputedFill.push(el as SVGGraphicsElement);
        }
      }
    });

    // Pick best strategy (most specific first)
    const matched =
      byAttribute.length > 0   ? byAttribute   :
      byFillAttr.length > 0    ? byFillAttr    :
      byComputedFill.length > 0 ? byComputedFill : [];

    if (matched.length === 0) return false;

    // --- Compute bounding box ---
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    matched.forEach(el => {
      try {
        const bb = (el as SVGGraphicsElement).getBBox();
        if (bb.width === 0 && bb.height === 0) return;
        minX = Math.min(minX, bb.x);
        minY = Math.min(minY, bb.y);
        maxX = Math.max(maxX, bb.x + bb.width);
        maxY = Math.max(maxY, bb.y + bb.height);
      } catch (_) {}
    });

    if (!isFinite(minX)) return false;

    const vbX = minX - PADDING;
    const vbY = minY - PADDING;
    const vbW = maxX - minX + PADDING * 2;
    const vbH = maxY - minY + PADDING * 2;

    const paths = matched.map(el => {
      const computedFill = window.getComputedStyle(el).fill;
      const fill = el.getAttribute('fill') || computedFill || '#ef4444';
      const opacity = el.getAttribute('opacity') || window.getComputedStyle(el).opacity || '1';
      const tag = el.tagName.toLowerCase();

      if (tag === 'path') {
        return { d: el.getAttribute('d') ?? '', fill, opacity };
      }
      return { d: el.outerHTML, fill, opacity };
    });

    setCutout({ paths, viewBox: `${vbX} ${vbY} ${vbW} ${vbH}` });
    return true;
  }, [region]);

  useEffect(() => {
    setCutout(null);
    setFailed(false);

    let succeeded = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    RETRY_DELAYS.forEach((delay, index) => {
      const t = setTimeout(() => {
        if (succeeded) return;
        const ok = extractCutout();
        if (ok) {
          succeeded = true;
        } else if (index === RETRY_DELAYS.length - 1) {
          // All retries exhausted — log SVG structure in dev to help debug
          if (process.env.NODE_ENV === 'development' && hiddenRef.current) {
            const svg = hiddenRef.current.querySelector('svg');
            if (svg) {
              console.group('[BodyPartCutout] All strategies failed. SVG debug info:');
              const elements = svg.querySelectorAll('*');
              const summary: Record<string, string[]> = {};
              elements.forEach(el => {
                const tag = el.tagName;
                const attrs = Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' ');
                if (!summary[tag]) summary[tag] = [];
                if (summary[tag].length < 5) summary[tag].push(attrs);
              });
              console.log('Attribute summary (first 5 per tag):', summary);
              console.log('SVG outerHTML (first 3000 chars):', svg.outerHTML.slice(0, 3000));
              console.groupEnd();
            }
          }
          setFailed(true);
        }
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [region, gender, view, extractCutout]);

  if (!region) return null;

  const label = region.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex flex-col items-center gap-3 w-full h-full">
      {/*
        CRITICAL: `visibility: hidden` keeps the element in layout so getBBox() works.
        `position: fixed` at 0,0 ensures it renders inside the viewport.
        DO NOT use `left: -9999px` or `opacity: 0` — both break getBBox() in most browsers.
      */}
      <div
        ref={hiddenRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '300px',
          height: '500px',
          pointerEvents: 'none',
          visibility: 'hidden',
          zIndex: -9999,
          overflow: 'hidden',
        }}
      >
        <Model
          data={[{ name: 'target', muscles: [region] }]}
          type={view}
          bodyType={gender}
          highlightedColors={['#ef4444']}
        />
      </div>

      {/* Visible cutout */}
      <div className="flex-1 w-full flex items-center justify-center">
        {cutout ? (
          <svg
            viewBox={cutout.viewBox}
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            style={{
              maxHeight: '200px',
              filter: 'drop-shadow(0 4px 12px rgba(239,68,68,0.3))',
            }}
          >
            <FullBodyBackdrop hiddenRef={hiddenRef} viewBox={cutout.viewBox} />

            {cutout.paths.map((p, i) => {
              if (p.d.startsWith('<')) {
                return <g key={i} dangerouslySetInnerHTML={{ __html: p.d }} />;
              }
              return (
                <path
                  key={i}
                  d={p.d}
                  fill="#ef4444"
                  opacity="0.9"
                  stroke="#dc2626"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
        ) : failed ? (
          <div className="flex flex-col items-center justify-center w-full h-32 gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg select-none">🫀</span>
            </div>
            <p className="text-xs text-muted-foreground text-center px-4">
              Preview unavailable for{' '}
              <span className="font-semibold capitalize">{label}</span>
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <p className="text-xs font-semibold text-primary uppercase tracking-widest">{label}</p>
    </div>
  );
};

/**
 * Renders all body paths as a faint anatomical backdrop for spatial context.
 */
const FullBodyBackdrop: React.FC<{
  hiddenRef: React.RefObject<HTMLDivElement>;
  viewBox: string;
}> = ({ hiddenRef, viewBox }) => {
  const [backdropPaths, setBackdropPaths] = useState<string[]>([]);

  useEffect(() => {
    if (!hiddenRef.current) return;
    const svg = hiddenRef.current.querySelector('svg');
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll('path'))
      .map(p => p.getAttribute('d') ?? '')
      .filter(Boolean);
    setBackdropPaths(paths);
  }, [hiddenRef, viewBox]);

  return (
    <>
      {backdropPaths.map((d, i) => (
        <path key={i} d={d} fill="#cbd5e1" opacity="0.25" />
      ))}
    </>
  );
};

export default BodyPartCutout;