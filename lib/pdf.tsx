import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { formatUkDate } from '@/lib/utils';
import type { Wtn, WtnParty, WtnSignature } from '@/lib/types';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#1B2330' },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  refLine: { fontSize: 9, color: '#4A5568', marginBottom: 16 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#C9CDC6',
    paddingBottom: 3,
  },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 140, color: '#4A5568' },
  value: { flex: 1 },
  twoCol: { flexDirection: 'row', gap: 24 },
  col: { flex: 1 },
  signatureBlock: { marginTop: 8, alignItems: 'flex-start' },
  signatureImg: { width: 160, height: 50, marginBottom: 4 },
  compliantTag: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1F7A4D',
    color: '#1F7A4D',
    fontSize: 9,
    fontWeight: 700,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
});

function partyDetail(party: WtnParty | undefined) {
  if (!party) return null;
  const roles = [
    party.role_producer && 'Producer',
    party.role_importer && 'Importer',
    party.role_local_authority && 'Local authority',
    party.role_permit_holder && 'Permit holder',
    party.role_exemption_holder && 'Registered exemption',
    party.role_carrier && 'Carrier',
    party.role_broker && 'Broker',
    party.role_dealer && 'Dealer',
  ].filter(Boolean);

  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{party.full_name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Company</Text>
        <Text style={styles.value}>{party.company_name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>
          {[party.address_line_1, party.address_line_2, party.city, party.postcode]
            .filter(Boolean)
            .join(', ')}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Role(s)</Text>
        <Text style={styles.value}>{roles.join(', ') || '—'}</Text>
      </View>
      {party.permit_number && (
        <View style={styles.row}>
          <Text style={styles.label}>Permit no.</Text>
          <Text style={styles.value}>{party.permit_number}</Text>
        </View>
      )}
      {party.registration_number && (
        <View style={styles.row}>
          <Text style={styles.label}>Registration no.</Text>
          <Text style={styles.value}>{party.registration_number}</Text>
        </View>
      )}
      {party.exemption_details && (
        <View style={styles.row}>
          <Text style={styles.label}>Exemption</Text>
          <Text style={styles.value}>{party.exemption_details}</Text>
        </View>
      )}
    </View>
  );
}

export async function renderWtnPdf(
  wtn: Wtn & { sic_code?: string | null },
  parties: WtnParty[],
  signatures: WtnSignature[],
  signatureImages: { transferor?: string; transferee?: string }
) {
  const transferor = parties.find((p) => p.party_type === 'transferor');
  const transferee = parties.find((p) => p.party_type === 'transferee');
  const transferorSig = signatures.find((s) => s.party_type === 'transferor');
  const transfereeSig = signatures.find((s) => s.party_type === 'transferee');

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Waste Transfer Note</Text>
        <Text style={styles.refLine}>
          Reference {wtn.reference_number} · Status {wtn.status.toUpperCase()}
        </Text>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Transferor</Text>
            {partyDetail(transferor)}
            {wtn.sic_code && (
              <View style={styles.row}>
                <Text style={styles.label}>SIC code</Text>
                <Text style={styles.value}>{wtn.sic_code}</Text>
              </View>
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Transferee</Text>
            {partyDetail(transferee)}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Waste</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{wtn.waste_description}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>EWC code</Text>
          <Text style={styles.value}>{wtn.ewc_code}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{wtn.quantity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Containment</Text>
          <Text style={styles.value}>
            {wtn.containment_type === 'other' ? wtn.containment_other : wtn.containment_type}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Transfer</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Date / time</Text>
          <Text style={styles.value}>
            {formatUkDate(wtn.transfer_date)} at {wtn.transfer_time}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Place</Text>
          <Text style={styles.value}>{wtn.place_of_transfer}</Text>
        </View>
        {wtn.broker_dealer_name && (
          <View style={styles.row}>
            <Text style={styles.label}>Broker / dealer</Text>
            <Text style={styles.value}>
              {wtn.broker_dealer_name} ({wtn.broker_dealer_registration_number || 'no reg. number given'})
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Declaration</Text>
        <Text>
          The transferor confirms it has applied the waste hierarchy when
          transferring this waste, as required by the Waste (England and
          Wales) Regulations 2011.
        </Text>

        <View style={styles.twoCol}>
          <View style={[styles.col, styles.signatureBlock]}>
            <Text style={styles.label}>Transferor signature</Text>
            {signatureImages.transferor && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF primitive, not an HTML img
              <Image style={styles.signatureImg} src={signatureImages.transferor} />
            )}
            <Text>{transferorSig?.signed_name}</Text>
            <Text style={{ color: '#4A5568' }}>{transferorSig?.represented_as}</Text>
          </View>
          <View style={[styles.col, styles.signatureBlock]}>
            <Text style={styles.label}>Transferee signature</Text>
            {signatureImages.transferee && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF primitive, not an HTML img
              <Image style={styles.signatureImg} src={signatureImages.transferee} />
            )}
            <Text>{transfereeSig?.signed_name}</Text>
            <Text style={{ color: '#4A5568' }}>{transfereeSig?.represented_as}</Text>
          </View>
        </View>

        <Text style={styles.compliantTag}>WASTE HIERARCHY DUTY CONFIRMED</Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
