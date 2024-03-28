import * as fs from 'fs';


// Establish styles for:
// Good = RTT < 1000
// Low = RTT > 1000
// Offline = connected = false
const inputFilePath = process.argv[2];
if (!inputFilePath) {
    console.log('Specify an input file');
    process.exit();
}

interface LatLong {
    lat: number;
    long: number;
}

enum ConnectionState {
    Good = 'good',
    Low = 'low',
    Offline = 'offline'
}

interface CoordinateGroup {
    connectionState: ConnectionState,
    coordinates: LatLong[]
}

// const template = {
//     type: 'good', // good, low, offline
//     coordinates: [
//         {
//             lat: 123,
//             long: 123,
//         }
//     ]
// }

const parsedData: CoordinateGroup[] = [];

const inputFile = fs.readFileSync(inputFilePath).toString().split("\n");

// For simplicity, we're only paying attention to the 'Main' stream.
let lastLatLong: LatLong = {
    lat: 0,
    long: 0
};


for (const line of inputFile) {
    if (!line) {
        continue;
    }
    const parsedLine = JSON.parse(line);
    if (parsedLine.irlStat.latitude == lastLatLong.lat && parsedLine.irlStat.longitude == lastLatLong.long) {
        continue;
    }

    const streamStatus = parsedLine.streamStatuses[0];
    let connectionStatus = ConnectionState.Good;

    if (streamStatus.connected == false) {
        connectionStatus = ConnectionState.Offline;
    } else if (streamStatus.rtt > 1000) {
        connectionStatus = ConnectionState.Low;
    }

    if (parsedData.length < 1 || parsedData[parsedData.length - 1].connectionState != connectionStatus) {
        parsedData.push({
            connectionState: connectionStatus,
            coordinates: []
        });
    }

    parsedData[parsedData.length - 1].coordinates.push({
        lat: parsedLine.irlStat.latitude,
        long: parsedLine.irlStat.longitude
    });
    lastLatLong = { lat: parsedLine.irlStat.latitude, long: parsedLine.irlStat.longitude };
}

// Render to kml
fs.writeFileSync('output.kml', toKml(parsedData));

function toKml(coordinateGroups: CoordinateGroup[]) {
    let output = [];

    for (let coordinateGroup of coordinateGroups) {
        output.push(renderPlacemark(coordinateGroup));
    }

    return getKmlTemplate().replace('{{PLACEMARKS}}', output.join('\n'));
}

function renderPlacemark(coordinateGroup: CoordinateGroup) {
    let coordinateList: string[] = [];
    for (let coordinate of coordinateGroup.coordinates) {
        coordinateList.push(`${coordinate.long}, ${coordinate.lat},0`);
    }

    return '    <Placemark>\n' +
        '      <name>' + coordinateGroup.connectionState + '</name>\n' +
        '      <description></description>\n' +
        '      <styleUrl>#' + coordinateGroup.connectionState + '</styleUrl>\n' +
        '      <LineString>\n' +
        '        <extrude>1</extrude>\n' +
        '        <tessellate>1</tessellate>\n' +
        '        <altitudeMode>absolute</altitudeMode>\n' +
        '        <coordinates> \n' +
        coordinateList.join(',\n') +
        '        </coordinates>\n' +
        '      </LineString>\n' +
        '    </Placemark>\n';
}

function getKmlTemplate() {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n' +
        '  <Document>\n' +
        '    <name>Paths</name>\n' +
        '    <Style id="low">\n' +
        '      <LineStyle>\n' +
        '        <color>ffff00ff</color>\n' +
        '        <width>4</width>\n' +
        '      </LineStyle>\n' +
        '      <PolyStyle>\n' +
        '        <color>ffff00ff</color>\n' +
        '      </PolyStyle>\n' +
        '    </Style>\n' +
        '    <Style id="good">\n' +
        '      <LineStyle>\n' +
        '        <color>00ff00ff</color>\n' +
        '        <width>4</width>\n' +
        '      </LineStyle>\n' +
        '      <PolyStyle>\n' +
        '        <color>00ff00ff</color>\n' +
        '      </PolyStyle>\n' +
        '    </Style>\n' +
        '    <Style id="offline">\n' +
        '      <LineStyle>\n' +
        '        <color>ff0000ff</color>\n' +
        '        <width>4</width>\n' +
        '      </LineStyle>\n' +
        '      <PolyStyle>\n' +
        '        <color>ff000000</color>\n' +
        '      </PolyStyle>\n' +
        '    </Style>\n' +
        '    {{PLACEMARKS}}\n' +
        '  </Document>\n' +
        '</kml>'
}
/*
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Paths</name>
    <description>Examples of paths. Note that the tessellate tag is by default
      set to 0. If you want to create tessellated lines, they must be authored
      (or edited) directly in KML.</description>
    <Style id="yellowLineGreenPoly">
      <LineStyle>
        <color>7f00ffff</color>
        <width>4</width>
      </LineStyle>
      <PolyStyle>
        <color>7f00ff00</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>Absolute Extruded</name>
      <description>Transparent green wall with yellow outlines</description>
      <styleUrl>#yellowLineGreenPoly</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates> -112.2550785337791,36.07954952145647,2357
          -112.2549277039738,36.08117083492122,2357
          -112.2552505069063,36.08260761307279,2357
          -112.2564540158376,36.08395660588506,2357
          -112.2580238976449,36.08511401044813,2357
          -112.2595218489022,36.08584355239394,2357
          -112.2608216347552,36.08612634548589,2357
          -112.262073428656,36.08626019085147,2357
          -112.2633204928495,36.08621519860091,2357
          -112.2644963846444,36.08627897945274,2357
          -112.2656969554589,36.08649599090644,2357
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>

 */
