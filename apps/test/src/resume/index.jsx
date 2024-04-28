import React from 'react';

import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import Education from './Education';
import Experience from './Experience';
import Header from './Header';
import Skills from './Skills';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    '@media max-width: 400': {
      flexDirection: 'column',
    },
  },
  image: {
    marginBottom: 10,
  },
  leftColumn: {
    flexDirection: 'column',
    width: 170,
    paddingTop: 30,
    paddingRight: 15,
    '@media max-width: 400': {
      width: '100%',
      paddingRight: 0,
    },
    '@media orientation: landscape': {
      width: 200,
    },
  },
  footer: {
    fontSize: 12,
    fontFamily: 'Lato Bold',
    textAlign: 'center',
    marginTop: 25,
    paddingTop: 10,
    borderWidth: 3,
    borderColor: 'gray',
    borderStyle: 'dashed',
    '@media orientation: landscape': {
      marginTop: 10,
    },
  },
});

Font.register({
  family: 'Open Sans',
  src: `http://fonts.gstatic.com/s/opensans/v13/cJZKeOuBrn4kERxqtaUH3aCWcynf_cDxXwCLxiixG1c.ttf`,
});
Font.register({
  family: 'Lato',
  src: `http://fonts.gstatic.com/s/lato/v13/v0SdcGFAl2aezM9Vq_aFTQ.ttf`,
});
Font.register({
  family: 'Lato Italic',
  src: `https://fonts.gstatic.com/s/lato/v24/S6u8w4BMUTPHjxswWw.ttf`,
});
Font.register({
  family: 'Lato Bold',
  src: `https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVew8.ttf`
});

const Resume = props => (
  <Page {...props} style={styles.page}>
    <Header />
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <Image
          src="https://i.pinimg.com/originals/31/f8/3d/31f83df33ae4c7acb972275f59d60074.jpg"
          style={styles.image}
        />
        <Education />
        <Skills />
      </View>
      <Experience />
    </View>
    <Text style={styles.footer}>This IS the candidate you are looking for</Text>
  </Page>
);

const Output = () => (
  <Document
    author="Luke Skywalker"
    keywords="awesome, resume, start wars"
    subject="The resume of Luke Skywalker"
    title="Resume"
  >
    <Resume size="A4" />
    <Resume orientation="landscape" size="A4" />
    <Resume size={[380, 1250]} />
  </Document>
);

export default Output;