export const en = {
  meta: {
    title: "Cessna 150 – Interactive Guide",
    description:
      "An interactive guide to the Cessna 150 — V-speeds, flaps, fuel, trim and procedures, in instruments you can actually touch.",
  },
  hero: {
    overline: "AN INTERACTIVE GUIDE",
    subtitle: "SLOW, SIMPLE, BELOVED",
    subtitleSecond: "CONTINENTAL O-200-A",
    description:
      "Two seats, a high wing, a hundred unhurried horsepower. That's the whole airplane. It asks for very little and gives you room to learn everything, which is why most of us never quite get over ours.",
    cta: "EXPLORE AIRCRAFT",
    procedures: "PROCEDURES",
    specsTitle: "AIRCRAFT SPECIFICATIONS",
    specs: {
      model: "MODEL",
      seats: "SEATS",
      production: "PRODUCTION",
      engine: "ENGINE",
      hp: "HP",
      mtow: "MTOW",
    },
  },
  heritage: {
    section: "HERITAGE",
    heading: "The classic two-seat trainer",
    p1Pre: "The ",
    p1Aircraft: "Cessna 150",
    p1Post:
      " is one of the most-flown trainers ever built. Honest, forgiving and cheap to run, it taught generations of pilots to fly, and you'll still find them at flying clubs and flight schools worldwide.",
    p2:
      "The figures here come from Cessna's 1969 Owner's Manual for the Model 150J, whose FAA type certificate is",
    p3:
      "Built from 1958 to 1977, then replaced by the Cessna 152, with roughly 24,000 made across every variant. Few trainers have ever been built in those numbers.",
    facts: {
      firstFlight: "FIRST FLIGHT",
      production: "PRODUCTION",
      units: "UNITS BUILT",
      refPoh: "REFERENCE POH",
    },
  },
  overview: {
    title: "Aircraft Overview",
    intro:
      "The Cessna 150 by the numbers, as published in the 1969 Owner's Manual for the ‘J’. Engine, weights, speeds, and the limits you actually fly by.",
    specs: {
      engine: { label: "Engine", value: "Continental O-200-A", detail: "4-cyl. air-cooled · 100 HP @ 2,750 RPM" },
      propeller: { label: "Propeller", value: "Fixed-Pitch", detail: "McCauley 1A101 · 69 in diameter" },
      fuel: { label: "Fuel", value: "26 US gal", detail: "22.5 usable · 80/87 min grade (100LL OK)" },
      emptyWeight: { label: "Empty Weight", value: "1,005 lb", detail: "Trainer config (typical)" },
      usefulLoad: { label: "Useful Load", value: "595 lb", detail: "Pilot + passenger + baggage + fuel" },
      ceiling: { label: "Service Ceiling", value: "12,650 ft", detail: "Standard day, gross weight" },
      cruise: { label: "Cruise Speed", detail: "75% power · 7,000 ft (TAS)" },
      range: { label: "Range", value: "475 sm", detail: "75% @ 7,000 ft, 22.5 gal, no reserve" },
    },
    limits: {
      heading: "KEY LIMITATIONS",
      note: "POH airspeed limits (CAS)",
      vne: "Never exceed (red line)",
      vno: "Max structural cruising",
      va: "Maneuvering",
      vs0: "Stall, flaps 40°",
    },
  },
  airspeed: {
    title: "V-Speeds",
    intro:
      "Every speed that matters in the 150 lives on one dial, and the colored arcs do most of the thinking for you. White is where flaps are allowed, green is normal everyday flying, yellow is for smooth air only, and the red line is the speed you never cross. Learn the colors and you rarely need to remember the numbers.",
    intro2:
      "The arcs match the 1969 Owner's Manual for the 150J, in calibrated airspeed. Hover over the dial below and each band will tell you what the airplane is doing at that speed.",
    callout:
      "Most 150s have their POH and airspeed indicator marked in MPH. Some aircraft have had their avionics updated and read in knots. Use the toggle to switch units.",
    callout_mphStrong: "MPH",
    zones: {
      white: "White Arc",
      green: "Green Arc",
      yellow: "Yellow Arc",
      red: "Red Line",
    },
    pilotNote: "PILOT NOTE",
    pilotNoteBody:
      "Flap operating range is the white arc ({white}). The yellow arc should be entered only in smooth air. Operations above the red line ({red}) are prohibited.",
    current: "CURRENT READING",
    digit: { airspeed: "AIRSPEED" },
    contexts: {
      idle: "Hover over the gauge to see what each speed means.",
      belowStall: {
        label: "Below Stall",
        body: "The aircraft cannot sustain flight at this speed, even with full flaps deployed.",
      },
      flapsOnly: {
        label: "Flaps Required",
        body: "Below clean stall speed (VS1). The aircraft can only fly with flaps extended; clean, it stalls.",
      },
      normalFlaps: {
        label: "Normal · Flaps Permitted",
        body: "Inside both the white and green arcs. Flaps may be extended or retracted as required by the maneuver.",
      },
      normalClean: {
        label: "Normal · Flaps Up",
        body: "Above maximum flap-extended speed (VFE). Flaps must remain retracted to avoid exceeding the structural limit.",
      },
      caution: {
        label: "Caution",
        body: "Yellow arc. Operate only in smooth air and avoid abrupt control inputs.",
      },
      exceed: {
        label: "Never Exceed",
        body: "Beyond VNE. Operation is prohibited; risk of structural failure.",
      },
    },
  },
  units: {
    title: "MPH, Knots & the C150",
    intro:
      "Pilots learning on the 150 meet an oddity on day one: the airspeed indicator and the POH speak in MPH, while modern charts, ATC and avionics speak in knots. If you grew up with the metric system, both are foreign. Below: the decoder, the history, and a slider to feel each speed.",
    decoder: {
      title: "DECODER — WHEN YOU SEE...",
      intro:
        "Every statute (mile) unit on the left has a nautical (knot) counterpart on the right. KIAS / MIAS are what the dial reads; KTAS / MTAS are the real speed of the air going past the airplane, corrected for altitude and temperature.",
      statuteHeading: "STATUTE · MILE-BASED",
      nauticalHeading: "NAUTICAL · KNOT-BASED",
      items: {
        sm: "Statute mile · 1,609 m (the U.S. road mile)",
        mph: "Statute miles per hour",
        mias: "Indicated airspeed in mph (raw dial reading)",
        mtas: "True airspeed in mph (corrected — the real speed)",
        nm: "Nautical mile · 1,852 m (one minute of arc)",
        kts: "Knots · nautical miles per hour (1 KT = 1 NM/h)",
        kias: "Indicated airspeed in knots (raw dial reading)",
        ktas: "True airspeed in knots (corrected — the real speed)",
      },
    },
    whyMph: {
      label: "WHY THE C150 USES MPH",
      body:
        "The Cessna 150 was designed in the late 1950s, when American general aviation measured speed in statute miles per hour. The 1969 Owner's Manual for the 150J lists every reference speed — VS, VFE, VNE, VY, VX — in MPH IAS. This was not an exception: it was the standard for light aircraft of the era. Cessna's piston singles only began shipping with knots-marked airspeed indicators in the mid-1970s.",
    },
    whyKnots: {
      label: "WHY MODERN AVIATION USES KNOTS",
      body:
        "ICAO, the FAA, EASA and virtually every manufacturer standardized on knots. The reason is geometric: one minute of latitude equals exactly one nautical mile, which reduces navigation to mental arithmetic. A 60-knot groundspeed covers one minute of latitude per minute of flight — time, distance and headings click together with no conversion factors.",
    },
    smVsNm: {
      label: "STATUTE MILE vs NAUTICAL MILE",
      body:
        "The statute mile (sm) is the U.S. road mile: 1,609.34 m. The nautical mile (nm) is Earth's geometry — 1,852 m, exactly one minute of arc along a great circle. One knot is one nautical mile per hour. Because the nautical mile is ~15% longer than the statute mile, the same true speed reads as a smaller number in knots than in MPH.",
    },
    modernized: {
      label: "MODERNIZED 150s",
      body:
        "Many of the 150s still flying have updated panels. You will find airspeed indicators marked in knots only, or dual-scale dials showing MPH and knots in parallel (one on the outer ring, the other on the inner). Always confirm which scale your specific aircraft uses — and which units its supplemental POH lists — before flight.",
    },
    exactTitle: "EXACT FORMULA",
    exactBody:
      "Multiply by the conversion factor and round to the nearest unit.",
    exactKtsToMph: "MPH = KTS × 1.15078",
    exactMphToKts: "KTS = MPH × 0.86898",
    exactNote:
      "1 nautical mile = 1.15078 statute miles · 1 statute mile = 0.86898 nautical miles. Metric: 1 KT = 1.852 km/h · 1 MPH = 1.609 km/h.",
    slider: {
      title: "TRY IT — SPEED CONVERTER",
      intro:
        "Drag the slider. The same speed is shown in MPH, knots and km/h, and the box below describes what the C150 would be doing at that speed.",
      hint: "Drag to change speed →",
      mphFull: "Statute mph",
      ktsFull: "Knots",
      kmhFull: "Kilometers/hour",
      contextLabel: "AT THIS SPEED, THE C150 IS…",
      contexts: {
        taxi: {
          label: "Taxiing or parked",
          body:
            "Below the speed where the wing can lift the airplane. This is taxi pace or slower — feet on the pedals, hand on the throttle, nose into wind.",
        },
        belowStall: {
          label: "Below stall speed",
          body:
            "The wing cannot generate enough lift to sustain flight. The airplane would be falling, not flying. The stall horn would be sounding.",
        },
        stallRegime: {
          label: "Stall regime",
          body:
            "With flaps 40° the airplane stalls at VS0 = 48 MPH. Clean (no flaps) it stalls higher at VS1 = 55 MPH. The white arc on the airspeed indicator starts here.",
        },
        slowFlight: {
          label: "Slow flight with flaps",
          body:
            "Inside the white arc. Short-field final approach is flown at 58 MPH with flaps 40°. Slow, nose-up, lots of throttle to hold altitude.",
        },
        vxGlide: {
          label: "Best angle / best glide",
          body:
            "VX = 64 MPH gives the steepest climb — most altitude per ground covered, used when an obstacle blocks the climbout. Best engine-out glide is 65 MPH.",
        },
        vyClimb: {
          label: "Best rate of climb",
          body:
            "VY = 73 MPH gives the most altitude per unit of time. This is the standard climb attitude after takeoff with no obstacles ahead.",
        },
        pattern: {
          label: "Pattern speed",
          body:
            "Traffic-pattern speed: climbing out, downwind, base. Inside both the white arc (flaps allowed) and the green arc (normal operations).",
        },
        cruise: {
          label: "Cruise",
          body:
            "Normal operating range. ~110 MPH is typical at 75% power and 7,000 ft. Flaps must be retracted above VFE = 100 MPH.",
        },
        caution: {
          label: "Caution — yellow arc",
          body:
            "Above VNO = 120 MPH (maximum structural cruising). Operate only in smooth air, no abrupt control inputs — gusts could overstress the airframe.",
        },
        vne: {
          label: "Above VNE — prohibited",
          body:
            "Past the red line at 162 MPH. Operation is forbidden — risk of structural failure or control-surface flutter.",
        },
      },
    },
    quickTitle: "QUICK RULE (+10)",
    quickBody:
      "For the speeds you actually fly, a useful mental shortcut:",
    quickKtsToMph: "MPH ≈ KTS + 10",
    quickMphToKts: "KTS ≈ MPH − 10",
    quickAccuracy:
      "Accurate within ~3 units between 60 and 90 KTS. Above 100 KTS the rule undershoots — at 110 KTS the real value is 127 MPH, the rule gives 120. For higher speeds use +15% (multiply by 1.15) instead.",
  },
  stall: {
    title: "Stall Speed & Bank Angle",
    intro:
      "Bank the airplane and the wing has to make more lift just to hold altitude. That extra load raises the speed at which it stalls, and the steeper the turn, the higher that speed climbs. The values here are the POH stalling speeds for the 150J: power off, 1,600 lb, calibrated airspeed.",
    flapConfigs: {
      up: "Flaps UP",
      twenty: "Flaps 20°",
      forty: "Flaps 40°",
    },
    bankIndicator: "BANK ANGLE INDICATOR",
    stallSpeed: "STALL SPEED",
    loadFactor: "LOAD FACTOR",
    chartTitle: "STALL SPEED vs BANK ANGLE",
    chartCaption: "{config} · power off · 1,600 lb · base {base}",
    chartXAxis: "Bank Angle",
    chartYAxis: "Stall Speed ({unit})",
    chartStallTooltip: "Stall Speed",
    remember: "REMEMBER",
    rememberBody:
      "At 60° of bank you're pulling 2 G and the stall speed climbs about 41%. A steep turn down low is the worst place to find that out, so keep some margin.",
  },
  flaps: {
    title: "Flaps Configuration",
    intro:
      "The Cessna 150 has fully electric wing flaps. A DC motor at the wing root drives a jackscrew that extends or retracts the flap pushrods, controlled from the cabin by a three-position toggle (UP / OFF / DOWN) on the instrument panel. The motor runs only while the switch is held, so you watch the analog flap-position indicator and release the switch at the desired deflection. The circuit is protected by a SLO-BLO fuse (POH §2-3). Maximum speed with any flap deployment (VFE) is {vfe} per POH §3-2, coincident with the upper end of the white arc on the airspeed indicator. POH §2-9 states that 30° and 40° \"are not recommended at any time for take-off\", and §2-10 calls for an immediate reduction to 20° on a go-around.",
    intro2:
      "Flaps add camber and (above 20°) drag, lowering stall speed and steepening the descent path without adding airspeed. Hold the motor switch below to drive the flaps to any position between UP and 40°. The placard, airfoil cross-section and reference speeds all update with the current deflection.",
    configuration: "CONFIGURATION",
    flapsTitle: "FLAPS {label}",
    items: {
      vs: "VS (STALL)",
      vfe: "VFE (MAX)",
      approach: "APPROACH",
      position: "POSITION",
      vx: "VX (BEST ANGLE)",
      vy: "VY (BEST RATE)",
      glide: "BEST GLIDE",
      shortField: "SHORT FIELD",
    },
    pilotNote: "PILOT NOTE",
    indicator: "FLAP POSITION INDICATOR",
    clean: "Clean",
    notPublished: "Not in POH",
    nearest: "NEAREST DETENT",
    measured: "MEASURED ANGLE",
    cabinView: "VIEW FROM CABIN",
    switchLabel: "FLAP MOTOR SWITCH",
    switchUp: "UP",
    switchOff: "OFF",
    switchDown: "DOWN",
    switchHint:
      "Click UP or DOWN to run the motor. Flaps stop only when you return the switch to OFF, just like the real airplane.",
    soundLabel: "MOTOR SOUND",
    soundOn: "ON",
    soundOff: "MUTE",
    legend: "DETENTS",
    settings: {
      up: {
        role: "CRUISE / CLIMB",
        desc: "Clean configuration. Used for cruise, normal climb and obstacle-clearance take-offs.",
        notes:
          "Normal and maximum-performance take-offs are flown with flaps up (POH §2-9). VX 64 / VY 73 / Best Glide 65 (all MPH IAS).",
      },
      ten: {
        role: "SOFT / SHORT GROUND ROLL",
        desc: "Reserved for minimum ground runs or take-off from soft or rough fields with no obstacles ahead. Shortens ground run ~10%.",
        notes:
          "If 10° is used on the ground run, leave it extended rather than retracting in the climb to the obstacle. The POH does not publish a stall speed for 10°.",
      },
      twenty: {
        role: "PATTERN / GO-AROUND",
        desc: "Intermediate setting, and the go-around (balked landing) setting: reduce to 20° immediately after applying full power.",
        notes:
          "Useful for maneuvering in the pattern. Continue retraction once a safe airspeed is reached.",
      },
      forty: {
        role: "FULL FLAPS / LANDING",
        desc: "Full flaps for landing. Maximum lift and drag, shortens landing distance significantly.",
        notes:
          "POH: 30°/40° are NOT recommended for take-off. Short-field approach is flown at 58 MPH with 40° flaps.",
      },
    },
  },
  throttle: {
    title: "Throttle & Power",
    intro:
      "The Cessna 150's throttle is a black push-pull knob mounted in the lower center of the instrument panel, placarded \"THROTTLE PUSH OPEN\". A sheathed cable runs through the firewall to the throttle butterfly on the Marvel-Schebler carburetor: push the knob IN to open the throttle, pull OUT to close. There is no throttle quadrant on this airframe; a small chromed friction lock at the top of the shaft holds the setting against engine vibration. The Continental O-200-A is rated 100 BHP at 2,750 RPM (POH §3-3, red line). The 1969 POH lists Cruise as 2,000–2,750 RPM, Magneto Check at 1,700 RPM (§1-2 before-takeoff), and Engine Start at \"Throttle — Open 1/4 inch\" (§2-13).",
    intro2:
      "On the fixed-pitch McCauley 1A101 propeller there is no separate prop control, so throttle position maps almost directly to RPM. Drag the knob below: the tachometer needle follows and the placard names the régime you are flying.",
    callout:
      "Maximum engine RPM (red line) is 2,750. Per POH §2-13, do not operate below 1,000 RPM. That's the warm-up minimum and the floor for sustained ground operation.",
    current: "CURRENT POWER",
    pilotNote: "PILOT NOTE",
    pilotNoteBody:
      "Maximum engine speed (red line) is {redline}. The green arc shown here (2,000–2,550 RPM) is the sea-level normal range; per POH §3-3 it widens with altitude, up to 2,000–2,750 RPM at 10,000 ft. Treat full throttle as a takeoff / climb setting, not a cruise one.",
    digit: { rpm: "RPM", hundreds: "× 100" },
    soundOn: "ON",
    soundOff: "MUTE",
    lever: {
      title: "THROTTLE",
    },
    zones: {
      green: "Green Arc (SL)",
      red: "Red Line",
    },
    contexts: {
      belowMin: {
        label: "Below Recommended",
        body: "Below 1,000 RPM, sustained operation here is not recommended. POH §2-13 sets the warm-up RPM at 1,000; lower than that the engine can run rough and prolonged low-RPM running fouls the spark plugs.",
      },
      idle: {
        label: "Idle / Warm-up",
        body: "≈ 1,000 RPM, the POH warm-up setting and the recommended minimum for sustained ground operation. Hold here after start and during oil-temperature warm-up.",
      },
      taxi: {
        label: "Taxi",
        body: "≈ 1,200–1,500 RPM. Enough to keep the airplane rolling on a level surface without riding the brakes; on loose gravel keep it on the low side to spare the prop tips.",
      },
      runup: {
        label: "Run-up / Mag Check",
        body: "1,700 RPM per POH §2-8, held against the brakes for the magneto check (≤ 75 RPM drop, ≤ 75 RPM differential) and carb-heat verification before takeoff.",
      },
      economy: {
        label: "Economy Cruise",
        body: "≈ 65 % power. Long-range, low-fuel-burn cruise: lean the mixture, drag is low and the engine sips fuel.",
      },
      cruise: {
        label: "Normal Cruise",
        body: "≈ 75 % power. POH §2-10 shows 2,525 RPM at sea level for ~110 MPH TAS. Mixture leaned for best economy.",
      },
      climb: {
        label: "Climb Power",
        body: "Upper green arc. Used in the climb-out and after a go-around; full throttle once altitude and obstacles permit.",
      },
      takeoff: {
        label: "Takeoff / Full Power",
        body: "Full throttle, maximum continuous output. Static run-up should give ~2,500–2,600 RPM with carb heat off; airborne, full throttle delivers the placarded 2,750 RPM at the red line.",
      },
    },
  },
  fuel: {
    title: "Fuel & Fuel System",
    intro:
      "The Cessna 150 carries its fuel in two integral wing tanks, one in each wing root, holding 13 US gallons each. Fuel is fed by gravity, with no fuel pump on this high-wing airframe, flowing from both tanks through a single ON/OFF shutoff valve and a strainer down to the carburetor. Per the Owner's Manual it runs on 80/87 minimum-grade aviation gasoline (the red avgas of its era); today the universal 100LL (blue) is an approved higher-grade substitute. POH figure 2-2 lists 26.0 gal total, of which only 22.5 gal are usable in all flight conditions; 3.5 gal stay trapped as unusable fuel.",
    intro2:
      "Here is the catch every student meets on a classic like this one: the fuel quantity gauges are not to be trusted in flight. Float-type senders in a 50-year-old wing drift, stick and bounce in turbulence, and by regulation they are only required to read accurately at one point: EMPTY. So pilots measure fuel directly: climb up, open the filler cap and read the level with a calibrated dipstick (a marked stick, the “pipeta”). Fill the tanks below and dip them yourself.",
    callout:
      "Never plan fuel on the cockpit gauges of an aircraft this age. They are certified accurate only at zero usable fuel; everything above E is an estimate. Confirm quantity visually or with a calibrated dipstick before every flight.",
    specsTitle: "FUEL FACTS",
    units: {
      gal: "US gal",
      liters: "L",
      gph: "gal/h",
      lph: "L/h",
      inches: "in",
    },
    specs: {
      grade: {
        label: "Fuel grade",
        value: "80/87",
        detail: "min. aviation gasoline · 100LL (blue) is an approved substitute",
      },
      total: {
        label: "Total capacity",
        detail: "two wing tanks · 13 US gal each",
      },
      usable: {
        label: "Usable fuel",
        detail: "all flight conditions · POH fig. 2-2",
      },
      unusable: {
        label: "Unusable fuel",
        detail: "trapped in the system; never plan on it",
      },
      feed: {
        label: "Fuel feed",
        value: "Gravity",
        detail: "high wing · no fuel pump · shutoff valve ON/OFF",
      },
    },
    interactive: {
      title: "FUEL THE AIRPLANE & DIP THE TANKS",
      intro:
        "Grab the fuel nozzle and drag it onto a filler cap to pump, but the wing is sheet metal, so you cannot see how much actually went in. To know for sure, drag the dipstick into a tank and pull it back out: the wetted mark stays on the stick. Watch the gallon marks bunch near the top, where the tank is wider; exactly why a calibrated stick beats a float gauge.",
      nozzleLabel: "FUEL NOZZLE",
      nozzleHint: "Drag onto a filler cap to pump",
      dipstickLabel: "DIPSTICK",
      dipstickHint: "Drag into a tank, pull out to read",
      tankLeft: "LEFT TANK",
      tankRight: "RIGHT TANK",
      fueling: "FUELING…",
      full: "FULL",
      unknown: "—.—",
      unknownHint: "Dip to read",
      measuring: "MEASURING…",
      stickReads: "DIPSTICK READS",
      notDipped: "Not measured yet. Dip a tank.",
      gaugeTitle: "COCKPIT FUEL GAUGES",
      gaugeReliable: "Lazy & wrong above E",
      totalOnboard: "MEASURED TOTAL",
      usableOnboard: "USABLE",
      measureBothHint: "Dip both tanks to total the fuel",
      drainButton: "Drain tanks",
      stickVsGauge:
        "The stick measures the fuel directly; the float gauge only estimates it, and on an airframe this age it estimates badly. When they disagree, believe the stick.",
    },
    burn: {
      title: "FUEL BURN BY PHASE",
      intro:
        "Pick a phase to see the fuel flow and how long the usable fuel currently on board would last at that rate.",
      selectLabel: "PHASE",
      rate: "FUEL FLOW",
      endurance: "ENDURANCE",
      rangeLabel: "RANGE",
      fromUsable: "from {gal} usable on board",
      needMeasure: "Dip both tanks to compute endurance & range",
      noRange: "ground operation",
      pohNote:
        "Cruise and economy figures come from the POH cruise-performance chart; taxi, take-off/climb and descent are illustrative line estimates; actual burn depends on mixture, altitude and technique.",
      phases: {
        taxi: { label: "Taxi / Idle", note: "≈1,000–1,200 RPM on the ground" },
        takeoff: { label: "Take-off / Climb", note: "Full throttle, full rich" },
        cruise: { label: "Cruise 75%", note: "≈2,600 RPM · ~111 MPH TAS · POH" },
        economy: { label: "Economy cruise", note: "≈2,200 RPM · long range · POH" },
        descent: { label: "Descent", note: "Power back, mixture rich" },
      },
    },
    pilotNote: "PILOT NOTE",
    pilotNoteBody:
      "On the first flight of the day and after every refuel, drain a sample from the fuel strainer and each tank sump (POH preflight). Avgas is dyed: clear or cloudy fuel, or beads settling at the bottom of the cup, means water in the tanks. Keep draining until it runs clean and bright.",
  },
  trim: {
    title: "Elevator Trim",
    intro:
      "The Cessna 150's elevator trim is fully mechanical. A vertical wheel on the lower pedestal — between the seats — drives a cable that runs aft to a screwjack at the tail; the screwjack deflects a single small tab on the trailing edge of the elevator. No electric trim, no servos. The wheel carries a printed NOSE UP / NOSE DOWN scale with a white TAKE-OFF reference mark slightly nose-up of neutral. The 1969 POH §1-2 simply lists \"Trim Tab — TAKE-OFF setting\" in the before-takeoff checklist and elsewhere instructs the pilot to \"adjust elevator trim for climb / level flight / desired descent rate\" — phase settings are judged by feel, not by published numbers.",
    intro2:
      "What trim does: it doesn't change attitude, it removes the hand load on the yoke. Pick a scenario below, feel the force you would be holding without trim, then spin the wheel until it disappears.",
    callout:
      "Force values are instructor-taught and illustrative. The 1969 POH does not publish trim deflection ranges or yoke forces — actual force depends on speed, CG and weight.",
    current: "CURRENT FORCE",
    trimmed: "TRIMMED ✓",
    pull: "Pull {n} lb",
    push: "Push {n} lb",
    wheelLabel: "TRIM WHEEL",
    scaleNoseUp: "NOSE UP",
    scaleNoseDn: "NOSE DN",
    scaleTakeoff: "T.O.",
    trimReadout: "TRIM",
    pilotNote: "PILOT NOTE",
    pilotNoteBody:
      "Trim early and often. After any pitch or power change, re-trim — letting the airplane fly hands-off lets you scan instruments, read charts and configure for the next phase without fighting the yoke.",
    scenarioLabel: "SCENARIO",
    scenarios: {
      climb: {
        title: "Initial climb at Vy",
        scene: "Just after rotation. Full throttle, flaps up, climbing at 73 MPH.",
        explain:
          "Pitched up at low speed, the airplane wants to nose-down without back-pressure. Roll the wheel toward NOSE UP until the pull disappears.",
      },
      cruise: {
        title: "Level cruise 110 MPH",
        scene: "75 % power at ~2,525 RPM, 7,000 ft, level flight.",
        explain:
          "Level cruise needs only a touch of NOSE UP — far less than the climb. A light back-roll on the wheel trims the residual pull.",
      },
      approach: {
        title: "Final 65 MPH, flaps 40°",
        scene: "Short final, full flaps, low power, 65 MPH.",
        explain:
          "Full flaps + low speed = heavy pull without trim. Trim aggressively nose-up so the approach flies itself.",
      },
      descent: {
        title: "Cruise descent 120 MPH",
        scene: "Reduced power, flaps up, ~500 fpm down at 120 MPH.",
        explain:
          "Faster than your cruise trim setting, the airplane wants to nose-up. Roll the wheel toward NOSE DN until the push fades.",
      },
    },
    anatomy: {
      title: "TRIM TAB ANATOMY",
      elevator: "Elevator",
      tab: "Trim tab",
      stab: "Horizontal stabilizer",
      hint: "The trim tab deflects opposite to the elevator — that's why a tab-up setting holds the elevator down (nose-down trim) and vice-versa.",
    },
  },
  pilot: {
    title: "Pilot Notes",
    intro:
      "Procedures and memory items taken from the Cessna 1969 Owner's Manual for the Model 150J. These are a reference, not a substitute for the official POH — always consult the aircraft manual before flight.",
    memoryTitle: "MEMORY ITEMS — SPEEDS",
    disclaimer:
      "These notes are provided for reference only. Always consult the current FAA-approved Owner's Manual / POH for the specific Cessna 150 you are flying and comply with all applicable regulations and your operator's standard operating procedures.",
    motto: "FLY SAFE — FLY PROFESSIONAL",
    memory: {
      vs0: "Stall, flaps 40°",
      vs1: "Stall, flaps up",
      vx: "Best angle climb",
      vy: "Best rate climb (SL)",
      bestGlide: "Best Glide",
      bestGlideDesc: "Engine out, flaps up",
      vfe: "Max flaps extended",
      va: "Maneuvering",
      vno: "Max structural cruise",
      vne: "Never exceed",
    },
    proc: {
      normalTo: {
        title: "NORMAL TAKE-OFF",
        steps: [
          "Wing Flaps — UP",
          "Carburetor Heat — COLD",
          "Throttle — FULL OPEN",
          "Elevator Control — lift nose wheel at {v1}",
          "Climb Speed — {v2} until obstacles cleared, then set up NORMAL CLIMB",
        ],
      },
      maxPerfTo: {
        title: "MAXIMUM PERFORMANCE TAKE-OFF",
        source: "POH §1-2 (obstacle / short field)",
        steps: [
          "Wing Flaps — UP",
          "Carburetor Heat — COLD",
          "Brakes — HOLD",
          "Throttle — FULL OPEN",
          "Brakes — RELEASE",
          "Elevator Control — slightly tail low",
          "Climb Speed — {v1} with obstacles ahead",
        ],
      },
      climb: {
        title: "NORMAL CLIMB",
        steps: [
          "Airspeed — {v1} to {v2}",
          "Power — FULL throttle",
          "Mixture — RICH (unless engine is rough)",
        ],
      },
      normalLdg: {
        title: "NORMAL LANDING",
        steps: [
          "Mixture — RICH",
          "Carb Heat — apply FULL HEAT before closing throttle",
          "Airspeed — {v1} to {v2} (flaps up)",
          "Wing Flaps — as desired below {v3}",
          "Airspeed — {v4} to {v5} with flaps extended",
          "Touchdown — MAIN WHEELS first",
          "Landing Roll — lower nose wheel gently",
          "Braking — minimum required",
        ],
      },
      shortFieldLdg: {
        title: "SHORT FIELD LANDING",
        source: "POH §2-11",
        steps: [
          "Approach — POWER OFF at {v1} with flaps 40°",
          "Touchdown — MAIN WHEELS first",
          "Nose wheel — lower to ground; apply heavy braking",
          "Flaps — RETRACT after all three wheels are on the ground",
          "Elevator — hold FULL NOSE UP",
          "Brakes — maximum without sliding the tires",
        ],
      },
      goAround: {
        title: "GO-AROUND (BALKED LANDING)",
        source: "POH §2-11",
        steps: [
          "Throttle — FULL OPEN",
          "Wing Flaps — reduce to 20° immediately",
          "Airspeed — establish safe climb attitude",
          "Wing Flaps — slowly RETRACT to full up once safe",
          "Carb Heat — COLD",
        ],
      },
    },
  },
  controls: {
    units: "UNITS",
    language: "LANG",
    sound: "SOUND",
    detail: "Technical detail",
    why: "Why?",
    close: "Close",
  },
  nav: {
    index: "INDEX",
    partLabel: "PART",
    chapters: {
      aircraft: "The Aircraft",
      speeds: "Speeds",
      controls: "Cockpit Controls",
      operation: "Operation",
    },
    items: {
      heritage: "Heritage",
      overview: "Overview",
      airspeed: "V-Speeds",
      stall: "Stall & Bank",
      flaps: "Flaps",
      throttle: "Throttle",
      fuel: "Fuel",
      trim: "Trim",
      procedures: "Pilot Notes",
    },
  },
  footer: {
    madeWith: "Made with",
    by: "by",
    source: "Source on GitHub",
    disclaimerProject:
      "Love the 150 is an independent fan-made educational project.",
    disclaimerTrademark:
      "Cessna® and Cessna 150® are trademarks of Textron Aviation Inc.",
    disclaimerAffiliation:
      "This website is not affiliated with, endorsed by, or sponsored by Textron Aviation.",
  },
};

export type Dict = typeof en;
