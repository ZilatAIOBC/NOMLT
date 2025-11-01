import { Button } from "../ui/button";
import { Link } from "react-router-dom";

const bulletPoints = [
  "It often doesn't censor your ideas, it doesn't hold you back, and it doesn't stop at \"good enough.\"",
  "It unleashes creations that blur the line between imagination and reality.",
  "That power comes with responsibility—what you build is yours alone.",
  "By continuing, you accept that this AI is unlike anything you've tried before.",
];

export const WarningSection = (): JSX.Element => {
  return (
    <>
      {/* Desktop and Tablet Layout */}
      <section className="relative w-full h-[888px] lg:h-[888px] md:h-[700px] hidden sm:block bg-[linear-gradient(349deg,rgba(138,63,252,1)_14%,rgba(0,0,0,1)_64%)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[888px] lg:h-[888px] md:h-[700px]">
        <div className="absolute top-[120px] lg:top-[120px] md:top-[20px] left-[calc(50%_-_395px)] lg:left-[calc(50%_-_395px)] md:left-[calc(50%_-_300px)] w-[789px] lg:w-[789px] md:w-[600px] h-[450px] lg:h-[450px] md:h-[450px] rounded-[44px] border border-solid border-white blur-[4.85px] bg-[linear-gradient(310deg,rgba(12,5,21,1)_0%,rgba(138,63,252,0)_34%)]" />

        <div className="absolute top-[520px] lg:top-[520px] md:top-[410px] left-[calc(50%_-_158px)] lg:left-[calc(50%_-_158px)] md:left-[calc(50%_-_150px)] flex gap-[18px] z-10">
          <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="h-auto inline-flex items-center gap-2 pt-[5.5px] pb-[6.5px] px-4 lg:px-4 md:px-3 rounded-lg border border-solid border-[#8a3ffc] bg-transparent shadow-[0px_1px_0px_#0000000d] hover:bg-[#8a3ffc]/10"
            >
              <span className="[font-family:'Inter',Helvetica] font-normal text-white text-sm lg:text-sm md:text-xs sm:text-xs tracking-[0] leading-6 whitespace-nowrap">
                Learn More
              </span>
              <img src="/arrow.svg" alt="arrow" className="w-3.5 h-3.5 lg:w-3.5 lg:h-3.5 md:w-3 md:h-3 sm:w-2.5 sm:h-2.5" />
            </Button>
          </Link>

          <Link to="/signup">
            <Button className="h-auto inline-flex items-center gap-2 pt-[5.5px] pb-[6.5px] px-4 lg:px-4 md:px-3 sm:px-2 bg-[#8a3ffc] rounded-lg shadow-[0px_1px_0px_#0000000d] hover:bg-[#8a3ffc]/90">
              <span className="[font-family:'Inter',Helvetica] font-normal text-[#f0f0f0] text-sm lg:text-sm md:text-xs sm:text-xs tracking-[0] leading-6 whitespace-nowrap">
                Start Generating
              </span>
              <img src="/arrow.svg" alt="arrow" className="w-3.5 h-3.5 lg:w-3.5 lg:h-3.5 md:w-3 md:h-3 sm:w-2.5 sm:h-2.5" />
            </Button>
          </Link>
        </div>

        {/* Desktop bullet points - only show on large screens */}
        {bulletPoints.map((text, index) => (
          <div
            key={`desktop-${index}`}
            className="hidden lg:block absolute left-[calc(50%_-_354px)] w-[708px] flex items-start gap-2 [font-family:'Inter',Helvetica] text-white z-10"
            style={{ top: `${320 + index * 45}px` }}
          >
            <span className="text-base font-medium leading-none mt-0">● </span>
            <span className="text-[15px] font-medium leading-relaxed">
              {text}
            </span>
          </div>
        ))}

        {/* Tablet bullet points - only show on medium screens */}
        {bulletPoints.map((text, index) => (
          <div
            key={`tablet-${index}`}
            className="hidden md:block lg:hidden absolute left-[calc(50%_-_280px)] w-[560px] flex items-start gap-2 [font-family:'Inter',Helvetica] text-white z-10"
            style={{ top: `${210 + index * 45}px` }}
          >
            <span className="text-sm font-medium leading-none mt-0">● </span>
            <span className="text-sm font-medium leading-relaxed">
              {text}
            </span>
          </div>
        ))}

        {/* Mobile bullet points - only show on small screens */}
        {bulletPoints.map((text, index) => (
          <div
            key={`mobile-${index}`}
            className="block md:hidden lg:hidden absolute left-[calc(50%_-_170px)] w-[340px] flex items-start gap-2 [font-family:'Inter',Helvetica] text-white z-10"
            style={{ top: `${350 + index * 35}px` }}
          >
            <span className="text-sm font-medium leading-none mt-0">● </span>
            <span className="text-sm font-medium leading-relaxed">
              {text}
            </span>
          </div>
        ))}

        <img
          className="absolute top-[150px] lg:top-[150px] md:top-[60px] sm:top-[40px] left-[calc(50%_-_36px)] lg:left-[calc(50%_-_36px)] md:left-[calc(50%_-_20px)] sm:left-[calc(50%_-_15px)] w-[72px] lg:w-[72px] md:w-[50px] sm:w-[30px] h-[72px] lg:h-[72px] md:h-[50px] sm:h-[30px] z-10"
          alt="Warning"
          src="/warning.svg"
        />

        <img
          className="absolute top-[200px] lg:top-[200px] md:top-[150px] sm:top-[120px] left-[calc(50%_+_550px)] lg:left-[calc(50%_+_550px)] md:left-[calc(50%_+_400px)] sm:left-[calc(50%_+_250px)] w-[200px] lg:w-[200px] md:w-[150px] sm:w-[100px] h-[200px] lg:h-[200px] md:h-[150px] sm:h-[100px] z-10"
          alt="Globe"
          src="/globe.svg"
        />

        <img
          className="absolute top-[460px] lg:top-[460px] md:top-[350px] sm:top-[280px] left-[calc(50%_+_400px)] lg:left-[calc(50%_+_400px)] md:left-[calc(50%_+_300px)] sm:left-[calc(50%_+_200px)] w-[200px] lg:w-[200px] md:w-[150px] sm:w-[100px] h-[200px] lg:h-[200px] md:h-[150px] sm:h-[100px] z-10"
          alt="Globe 2"
          src="/globe2.svg"
        />

        <img
          className="absolute top-[450px] lg:top-[450px] md:top-[340px] sm:top-[270px] left-[calc(50%_+_720px)] lg:left-[calc(50%_+_720px)] md:left-[calc(50%_+_550px)] sm:left-[calc(50%_+_350px)] w-[210px] lg:w-[210px] md:w-[160px] sm:w-[110px] h-[300px] lg:h-[300px] md:h-[230px] sm:h-[150px] z-10"
          alt="Globe 3"
          src="/globe3.svg"
        />

        <img
          className="absolute top-[100px] lg:top-[100px] md:top-[80px] sm:top-[60px] left-[calc(50%_-_800px)] lg:left-[calc(50%_-_800px)] md:left-[calc(50%_-_600px)] sm:left-[calc(50%_-_400px)] w-[170px] lg:w-[170px] md:w-[130px] sm:w-[90px] h-[200px] lg:h-[200px] md:h-[150px] sm:h-[100px] z-10"
          alt="Globe 4"
          src="/globe4.svg"
        />

        <img
          className="absolute top-[300px] lg:top-[300px] md:top-[230px] sm:top-[180px] left-[calc(50%_-_580px)] lg:left-[calc(50%_-_580px)] md:left-[calc(50%_-_450px)] sm:left-[calc(50%_-_300px)] w-[150px] lg:w-[150px] md:w-[115px] sm:w-[80px] h-[200px] lg:h-[200px] md:h-[150px] sm:h-[100px] z-10"
          alt="Globe 5"
          src="/globe5.svg"
        />

        <img
          className="absolute top-[560px] lg:top-[560px] md:top-[420px] sm:top-[340px] left-[calc(50%_-_550px)] lg:left-[calc(50%_-_550px)] md:left-[calc(50%_-_420px)] sm:left-[calc(50%_-_280px)] w-[200px] lg:w-[200px] md:w-[150px] sm:w-[100px] h-[200px] lg:h-[200px] md:h-[150px] sm:h-[100px] z-10"
          alt="Globe 6"
          src="/globe6.svg"
        />

        <img
          className="absolute top-[630px] lg:top-[630px] md:top-[480px] sm:top-[390px] left-[calc(50%_-_930px)] lg:left-[calc(50%_-_930px)] md:left-[calc(50%_-_700px)] sm:left-[calc(50%_-_450px)] w-[300px] lg:w-[300px] md:w-[230px] sm:w-[150px] h-[200px] lg:h-[200px] md:h-[150px] sm:h-[100px] z-10"
          alt="Globe 7"
          src="/globe7.svg"
        />

        <img
          className="absolute top-[250px] lg:top-[250px] md:top-[190px] sm:top-[150px] left-[calc(50%_-_1000px)] lg:left-[calc(50%_-_1000px)] md:left-[calc(50%_-_750px)] sm:left-[calc(50%_-_500px)] w-[200px] lg:w-[200px] md:w-[150px] sm:w-[100px] h-[200px] lg:h-[200px] md:h-[150px] sm:h-[100px] z-10"
          alt="Globe 8"
          src="/globe10.svg"
        />

        <h2 className="absolute top-[240px] lg:top-[220px] md:top-[120px] sm:top-[50px] left-[calc(50%_-_99px)] lg:left-[calc(50%_-_99px)] md:left-[calc(50%_-_60px)] sm:left-[calc(50%_-_50px)] h-[72px] lg:h-[72px] md:h-[50px] sm:h-[25px] flex items-center justify-center [font-family:'Inter',Helvetica] font-normal text-white text-[40px] lg:text-[40px] md:text-[28px] sm:text-[14px] text-center tracking-[0] leading-[72px] lg:leading-[72px] md:leading-[50px] sm:leading-[25px] whitespace-nowrap z-10">
          Heads Up!
        </h2>

        <p className="absolute top-[280px] lg:top-[280px] md:top-[180px] sm:top-[120px] left-[calc(50%_-_354px)] lg:left-[calc(50%_-_354px)] md:left-[calc(50%_-_280px)] sm:left-[calc(50%_-_170px)] w-[708px] lg:w-[708px] md:w-[560px] sm:w-[340px] [font-family:'Inter',Helvetica] font-normal text-base lg:text-base md:text-sm sm:text-sm leading-[27px] lg:leading-[27px] md:leading-[20px] sm:leading-[18px] z-10">
          <span className="font-semibold text-[#ff0000]">Warning</span>
          <span className="font-semibold text-white">
            : this system generates results that may feel too real.
          </span>
        </p>
        </div>
      </section>

      {/* Mobile Layout */}
      <section className="relative w-full h-[600px] sm:hidden bg-[linear-gradient(349deg,rgba(138,63,252,1)_14%,rgba(0,0,0,1)_64%)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[600px]">
          {/* Mobile Card */}
          <div className="absolute top-[20px] left-[20px] right-[20px] h-[560px] rounded-[20px] border border-solid border-white bg-[linear-gradient(310deg,rgba(12,5,21,1)_0%,rgba(138,63,252,0)_34%)] p-6">
            
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <img
                className="w-[32px] h-[32px]"
                alt="Warning"
                src="/warning.svg"
              />
            </div>

            {/* Heads Up Heading */}
            <h2 className="text-center text-white text-[24px] font-normal mb-3">
              Heads Up!
            </h2>

            {/* Warning Text */}
            <p className="text-left text-white text-[14px] leading-[16px]  mb-8 mt-8">
              <span className="font-semibold text-[#ff0000]">Warning</span>
              <span className="font-semibold text-white">
                : this system generates results that may feel too real.
              </span>
            </p>

            {/* Bullet Points */}
            <div className="space-y-3 mb-8 mt-8">
              {bulletPoints.map((text, index) => (
                <div key={`mobile-bullet-${index}`} className="flex items-start gap-2 text-white">
                  <span className="text-[12px] font-medium leading-none mt-0">●</span>
                  <span className="text-[12px] font-medium leading-relaxed">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center mt-24">
              <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">
                <button
                  className="flex-1 h-auto inline-flex items-center gap-2 pt-[5.5px] pb-[6.5px] px-4 rounded-lg border border-solid border-[#8a3ffc] bg-transparent shadow-[0px_1px_0px_#0000000d] hover:bg-[#8a3ffc]/10"
                >
                  <span className="[font-family:'Inter',Helvetica] font-normal text-white text-sm tracking-[0] leading-6 whitespace-nowrap">
                    Learn More
                  </span>
                  <img src="/arrow.svg" alt="arrow" className="w-3.5 h-3.5" />
                </button>
              </Link>

              <Link to="/signup">
                <Button className="flex-1 h-auto inline-flex items-center gap-2 pt-[5.5px] pb-[6.5px] px-4 bg-[#8a3ffc] rounded-lg shadow-[0px_1px_0px_#0000000d] hover:bg-[#8a3ffc]/90">
                  <span className="[font-family:'Inter',Helvetica] font-normal text-[#f0f0f0] text-sm tracking-[0] leading-6 whitespace-nowrap">
                    Start Generating
                  </span>
                  <img src="/arrow.svg" alt="arrow" className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
