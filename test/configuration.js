var fs = require('fs');
var path = require('path');

var expect = require('chai').expect;
require('chai').use(require('chai-shallow-deep-equal'));
var tmp = require('tmp');
var yaml = require('js-yaml');
var util = require('../lib/util');
var csv = { stringify: require('csv-stringify') };

var configuration = require('../lib/boot/configuration');
var _compileDefaultConfiguration = configuration._compileDefaultConfiguration;

describe('reading in configuration files', function () {
  it('should test overlaying two settings', function () {
    var logger = require('log4js').getLogger('\t');
    logger.level = 1000;

    // input
    var defaultC = { name: 'ok', baseTracks: [] };
    var userC = { name: 'noway', filesConfig : {} };

    // setup
    var defaultDir = tmp.dirSync({ unsafeCleanup: true });
    var userDir = tmp.dirSync({ unsafeCleanup: true });

    var defaultDirFile = path.join(defaultDir.name, '.sequence-viewerrc');
    var userDirFile = path.join(userDir.name, '.sequence-viewerrc');

    fs.writeFileSync(defaultDirFile, yaml.dump(defaultC));
    fs.writeFileSync(userDirFile, yaml.dump(userC));

    // call
    var c = _compileDefaultConfiguration(defaultDirFile, userDirFile);

    // verify
    expect(c).to.deep.equal(Object.assign(defaultC, userC));

    // Manual cleanup 
    defaultDir.removeCallback();
    userDir.removeCallback();
  });

  it('should test overlaying one settings', function () {
    var logger = require('log4js').getLogger('\t');
    logger.level = 1000;

    // input
    var defaultC = { name: 'ok', baseTracks: [] };
    var userC = { name: 'noway', filesConfig : {} };

    // setup
    var defaultDir = tmp.dirSync({ unsafeCleanup: true });
    var userDir = tmp.dirSync({ unsafeCleanup: true });

    var defaultDirFile = path.join(defaultDir.name, '.sequence-viewerrc');
    var userDirFile = path.join(userDir.name, '.sequence-viewerrc');

    fs.writeFileSync(defaultDirFile, yaml.dump(defaultC));
    fs.writeFileSync(userDirFile, yaml.dump(userC));

    userDir.removeCallback();

    // call
    var c = _compileDefaultConfiguration(defaultDirFile, userDirFile);

    // verify
    expect(c).to.deep.equal(defaultC);

    // Manual cleanup 
    defaultDir.removeCallback();
  });

  it.skip('should throw if no default configuration found', function () {
    var logger = require('log4js').getLogger('\t');
    logger.level = 1000;

    var defaultDir = tmp.dirSync({ unsafeCleanup: true });
    var userDir = tmp.dirSync({ unsafeCleanup: true });

    var defaultDirFile = path.join(defaultDir.name, '.sequence-viewerrc');
    var userDirFile = path.join(userDir.name, '.sequence-viewerrc');

    try {
      var c = _compileDefaultConfiguration(defaultDirFile, userDirFile);
    } catch (e) {
      // console.log(e);
      expect(e instanceof Error).to.be.true;
    }
  });
});

describe('validating configuration files', function () {
  it('should verify contents of default file', function () {
    // var logger = require('log4js').getLogger('\t');
    // logger.level = 'debug';
    var c = configuration.compileDefaultConfiguration();

    var expected = {
      name: 'Untitled Experiment Group',
      description: 'No description provided (overlayed over mm10 genome tier and Gencode m11 gene annotation)',
      baseTracks: [
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
          featureInfoPlugin: function (feature, info) {
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
      ]
    }

    expect(c).to.shallowDeepEqual(expected);
  });

  describe('usability of configuration', function () {
    it('should not be usable with incomplete defaults', function (done) {
      var c = configuration.compileDefaultConfiguration();


      var config = new configuration.Configuration(c, null, true);
      config.usable(function (usable) {
        expect(usable).to.be.false;
        done();
      });
    });

    it('should be usable with csv + existing folder', function (done) {
      var logger = require('log4js').getLogger('\t');
      logger.level = 1000;
      
      var c = configuration.compileDefaultConfiguration();
      var tmpCwd = tmp.dirSync({ unsafeCleanup: true });
      var tmpFilesFolder = tmp.dirSync({ unsafeCleanup: true });

      var sampleExperiments = [
        { files: 'afile,twofile', other_column: 'yup.' },
        { files: 'just one here', other_column: 'row2' }
      ];

      csv.stringify(sampleExperiments, {
        header: true,
      }, function (err, csvString) {
        try {
          fs.writeFileSync(path.join(tmpCwd.name, '.sv.csv'), csvString);
        } catch (e) {
          console.log(e); expect(e).to.be.null;
        }

        var settings = {
          filesField: 'files',
          experimentsSource: {
            experimentsSourceType: 'csv',
            fileName: tmpCwd.name,
            hasHeaders: true
          },
          filesSource: {
            filesSourceType: 'folder',
            folder: tmpFilesFolder.name
          }
        }

        c = Object.assign(c, settings);

        var config = new configuration.Configuration(c, null, true);
        config.usable(function (usable) {
          console.log("result is <", usable, ">");


          tmpCwd.removeCallback();
          tmpFilesFolder.removeCallback();
          done();
        });
      });
    });


    it('should test csv without headers', function (done) {
      var logger = require('log4js').getLogger('\t');
      logger.level = 1000;
      
      var c = configuration.compileDefaultConfiguration();
      var tmpCwd = tmp.dirSync({ unsafeCleanup: true });
      var tmpFilesFolder = tmp.dirSync({ unsafeCleanup: true });

      var sampleExperiments = [
        [ 'files',         'other_column' ],
        [ 'afile,twofile', 'yup.' ],
        [ 'just one here', 'row2' ]
      ];

      csv.stringify(sampleExperiments, {
        header: true,
      }, function (err, csvString) {
        try {
          fs.writeFileSync(path.join(tmpCwd.name, '.sv.csv'), csvString);
        } catch (e) {
          console.log(e); expect(e).to.be.null;
        }

        var settings = {
          filesField: 'files',
          experimentsSource: {
            experimentsSourceType: 'csv',
            fileName: tmpCwd.name,
            hasHeaders: true
          },
          filesSource: {
            filesSourceType: 'folder',
            folder: tmpFilesFolder.name
          }
        }

        c = Object.assign(c, settings);

        var config = new configuration.Configuration(c, null, true);
        config.usable(function (usable) {
          console.log("result is <", usable, ">");


          tmpCwd.removeCallback();
          tmpFilesFolder.removeCallback();
          done();
        });
      });
    });
  });
});
