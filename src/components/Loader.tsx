"use client";

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

export default function Loader({ message = "Loading...", subMessage }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Hourglass Animation */}
      <div className="hourglassBackground">
        <div className="hourglassContainer">
          <div className="hourglassCurves" />
          <div className="hourglassCapTop" />
          <div className="hourglassGlassTop" />
          <div className="hourglassGlass" />
          <div className="hourglassSand" />
          <div className="hourglassSandStream" />
          <div className="hourglassCapBottom" />
          <div className="hourglassGlass" />
        </div>
      </div>

      {/* Message */}
      <p className="mt-6 text-lg font-medium text-white">{message}</p>
      {subMessage && (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{subMessage}</p>
      )}

      {/* CSS for hourglass */}
      <style jsx>{`
        .hourglassBackground {
          position: relative;
          background-color: rgb(71, 60, 60);
          height: 130px;
          width: 130px;
          border-radius: 50%;
        }

        .hourglassContainer {
          position: absolute;
          top: 30px;
          left: 40px;
          width: 50px;
          height: 70px;
          animation: hourglassRotate 2s ease-in 0s infinite;
          transform-style: preserve-3d;
          perspective: 1000px;
        }

        .hourglassContainer div,
        .hourglassContainer div:before,
        .hourglassContainer div:after {
          transform-style: preserve-3d;
        }

        @keyframes hourglassRotate {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(180deg); }
          100% { transform: rotateX(180deg); }
        }

        .hourglassCapTop {
          top: 0;
        }

        .hourglassCapTop:before {
          top: -25px;
        }

        .hourglassCapTop:after {
          top: -20px;
        }

        .hourglassCapBottom {
          bottom: 0;
        }

        .hourglassCapBottom:before {
          bottom: -25px;
        }

        .hourglassCapBottom:after {
          bottom: -20px;
        }

        .hourglassGlassTop {
          transform: rotateX(90deg);
          position: absolute;
          top: -16px;
          left: 3px;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          background-color: #999999;
        }

        .hourglassGlass {
          perspective: 100px;
          position: absolute;
          top: 32px;
          left: 20px;
          width: 10px;
          height: 6px;
          background-color: #999999;
          opacity: 0.5;
        }

        .hourglassGlass:before,
        .hourglassGlass:after {
          content: '';
          display: block;
          position: absolute;
          background-color: #999999;
          left: -17px;
          width: 44px;
          height: 28px;
        }

        .hourglassGlass:before {
          top: -27px;
          border-radius: 0 0 25px 25px;
        }

        .hourglassGlass:after {
          bottom: -27px;
          border-radius: 25px 25px 0 0;
        }

        .hourglassCurves:before,
        .hourglassCurves:after {
          content: '';
          display: block;
          position: absolute;
          top: 32px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #333;
          animation: hideCurves 2s ease-in 0s infinite;
        }

        .hourglassCurves:before {
          left: 15px;
        }

        .hourglassCurves:after {
          left: 29px;
        }

        @keyframes hideCurves {
          0% { opacity: 1; }
          25% { opacity: 0; }
          30% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 1; }
        }

        .hourglassSandStream:before {
          content: '';
          display: block;
          position: absolute;
          left: 24px;
          width: 3px;
          background-color: white;
          animation: sandStream1 2s ease-in 0s infinite;
        }

        .hourglassSandStream:after {
          content: '';
          display: block;
          position: absolute;
          top: 36px;
          left: 19px;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #fff;
          animation: sandStream2 2s ease-in 0s infinite;
        }

        @keyframes sandStream1 {
          0% { height: 0; top: 35px; }
          50% { height: 0; top: 45px; }
          60% { height: 35px; top: 8px; }
          85% { height: 35px; top: 8px; }
          100% { height: 0; top: 8px; }
        }

        @keyframes sandStream2 {
          0% { opacity: 0; }
          50% { opacity: 0; }
          51% { opacity: 1; }
          90% { opacity: 1; }
          91% { opacity: 0; }
          100% { opacity: 0; }
        }

        .hourglassSand:before,
        .hourglassSand:after {
          content: '';
          display: block;
          position: absolute;
          left: 6px;
          background-color: white;
          perspective: 500px;
        }

        .hourglassSand:before {
          top: 8px;
          width: 39px;
          border-radius: 3px 3px 30px 30px;
          animation: sandFillup 2s ease-in 0s infinite;
        }

        .hourglassSand:after {
          border-radius: 30px 30px 3px 3px;
          animation: sandDeplete 2s ease-in 0s infinite;
        }

        @keyframes sandFillup {
          0% { opacity: 0; height: 0; }
          60% { opacity: 1; height: 0; }
          100% { opacity: 1; height: 17px; }
        }

        @keyframes sandDeplete {
          0% { opacity: 0; top: 45px; height: 17px; width: 38px; left: 6px; }
          1% { opacity: 1; top: 45px; height: 17px; width: 38px; left: 6px; }
          24% { opacity: 1; top: 45px; height: 17px; width: 38px; left: 6px; }
          25% { opacity: 1; top: 41px; height: 17px; width: 38px; left: 6px; }
          50% { opacity: 1; top: 41px; height: 17px; width: 38px; left: 6px; }
          90% { opacity: 1; top: 41px; height: 0; width: 10px; left: 20px; }
        }
      `}</style>
    </div>
  );
}

// Simple spinner alternative
export function SimpleLoader({ size = 48 }: { size?: number }) {
  return (
    <div 
      className="border-4 border-[var(--border-subtle)] border-t-[var(--accent-primary)] rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}
