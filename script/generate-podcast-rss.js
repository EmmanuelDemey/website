const TITLE = 'Tech Ethique'
const OWNER = 'demey.emmanuel@gmail.com';
const AUTHOR = 'Emmanuel et Fanny DEMEY';
const DESCRIPTION = 'blablabla';
const IMAGE = 'http://...';
const LANGUAGE = 'FR';
const LINK = 'http://';

const data = require('../data/podcast.json');
const fs = require('fs');

const tracks = data.map(d => (
    `
    <item>
      <title>${d.title}</title>
      <description>${d.description}</description>
      <pubDate>${d.publicationDate}</pubDate>
      <enclosure url="${d.file}"
                 type="${d.fileType}" length="${d.fileLength}"/>
      <itunes:duration>${d.duration}</itunes:duration>
    </item>
    `
));

const mainXml = `
<rss version="2.0"
xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0"
xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
<channel>
<title>${TITLE}</title>
<googleplay:owner>${OWNER}</googleplay:owner>
<googleplay:author>${AUTHOR}</googleplay:author>
<description>${DESCRIPTION}</description>
<googleplay:image href="${IMAGE}"/>
<language>${LANGUAGE}</language>
<link>${LINK}</link>
${tracks}
</channel>
</rss>
`
fs.writeFileSync(__dirname + '/../_site/podcast.xml', mainXml);