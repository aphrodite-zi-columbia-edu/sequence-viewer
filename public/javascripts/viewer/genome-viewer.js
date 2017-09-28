var gvUtil = {};

/**
 * This function defines where the viewer starts out positioned in the genome.
 * For debugging, these locations were used:
 * 
 * @return {object} configurationBase
 * 
 * * 12:56,694,976-56,714,605
 * * chr:       '12', viewStart: 56694976, viewEnd:   56714605
 * * chr:       '17', viewStart: 30743553, viewEnd:   30778640
 */
gvUtil.getDefaultRange = function getDefaultRange() {
  return { chr: '12', viewStart: 56694976, viewEnd: 56714605 };
};

/**
 * These settings are documented @ http://www.biodalliance.org/config.html.
 */
gvUtil.getConfiguration = function getConfiguration() {
  var range = gvUtil.getDefaultRange();
  range.maxHeight = 800;
  range.noPersist = true;
  range.coordSystem = getCoordSystem();
  range.sources = [];
  return range;
};

/**
 * TODO Not currently used
 */
var baseTracks = [
  {
    name: 'Genome', tier_type: 'sequence',
    twoBitURI: '//www.biodalliance.org/datasets/GRCm38/mm10.2bit',
  },
  {
    name: 'GENCODE version M11',
    bwgURI: 'http://ngs.sanger.ac.uk/production/gencode/trackhub/data/gencode.vM11.annotation.bb',
    stylesheet_uri: 'http://www.biodalliance.org/stylesheets/gencode.xml',
    collapseSuperGroups: true,
    trixURI: 'http://ngs.sanger.ac.uk/production/gencode/trackhub/data/gencode.vM11.annotation.ix',
    noSourceFeatureInfo: true,
    featureInfoPlugin: function gencodeFIP(feature, info) {
      var isGene = false;
      (info.hit || []).forEach(function (hit) {
        if (hit.isSuperGroup) isGene = true;
      });

      if (!isGene) {
        info.setTitle('Transcript: ' + feature.label);
        info.add('Transcript ID', feature.label);
        info.add('Transcript biotype', feature.method);

      } else {
        info.setTitle('Gene: ' + feature.geneId);
      }

      info.add('Gene ID', feature.geneId);
      info.add('Gene name', feature.geneName);
      info.add('Gene biotype', feature.geneBioType);

      if (!isGene) {
        info.add('Transcript attributes', feature.tags);
      }
    }
  }
];

baseTracks = [
  {
    name: 'Genome', tier_type: 'sequence',
    twoBitURI: '//www.biodalliance.org/datasets/GRCm38/mm10.2bit',
  }
];

gvUtil.addBaseTracks = function addBaseTracks(browser, done) {
  done = done || function() {};

  setTimeout(function() {
    baseTracks.forEach(function (configuration) {
      console.log("adding", configuration.name);
      browser.addTier(configuration);
    });

    done();
  }, 50);
}

/**
 * 
 * docs: https://www.biodalliance.org/config.html
 * 
 * @return {object} cs coordSystem 
 * @param {string} cs.speciesName can be a human-readable label.
 * @param {number} cs.taxon integer identified from the NCBI Taxonomy
 *                          http://www.ncbi.nlm.nih.gov/taxonomy
 * 
 * @param {string} cs.auth and 
 * @param {string} cs.version should, as far as possible, match authority and
 *                            version strings used in the DAS Registry.
 *                            http://dasregistry.org/
 * 
 * @param {string} cs.ucscName optional, but should be the UCSC genome
 *                             browser name of the assembly if it is defined.
 *                             This enables track-hub support to work
 *                             properly.
 * 
 * Source for the DAS Figures (auth and version) were taken from
 * [this reference implementation](https://www.biodalliance.org/mouse38.html).
 */
function getCoordSystem() {
  return {
    speciesName: 'Mus Muris',
    taxon: 10090,
    auth: 'GRCm',
    version: '38',
    ucscName: 'mm10'
  };
}

// from nodejs route
// var bwURLBase = SEQUENCE_VIEWER_CONFIGURATION.bigWigConfig.url || '';

function determineURLBase() {
  if (SEQUENCE_VIEWER_CONFIGURATION.bigWigConfig.url)
    return SEQUENCE_VIEWER_CONFIGURATION.bigWigConfig.url;
  if (SEQUENCE_VIEWER_CONFIGURATION.bigWigConfig.folder)
    return '/viewer/files/';
}
var bwURLBase = determineURLBase();

function hashStringToColor(str) {
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }

  var r = (hash & 0xFF0000) >> 16;
  var g = (hash & 0x00FF00) >> 8;
  var b = hash & 0x0000FF;

  function hexChannel(c) { return c.toString(16).substr(-2); }

  return "#" + [r, g, b].map(hexChannel).join('');
}

gvUtil.tierConfig = function tierConfig(name, description) {
  return {
    name: description
      ? description.substring(0, 10) + '...: ' + name
      : name,
    desc: description || '',
    bwgURI: bwURLBase + '/' + name, // TODO proper join
    // noDownsample: true,
    style: [{
      type: 'default',
      style: {
        glyph: 'HISTOGRAM',
        BGCOLOR: hashStringToColor(name),
        HEIGHT: 100,
        id: 'style1'
      }
    }],
    credentials: true
  };
};
