import { createPdfGenApiClient, PdfDocumentDetails } from '@pdfgen/sdk';
import { Document, Page, Text } from '@react-pdf/renderer';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

const api = createPdfGenApiClient({token: 'NjY3ZWRiNGJlOGFmMWJjMjhiZDA0NTg0.Nzrk3eO-9-BLyZthlcKvEmQGuHw', hostname: 'http://localhost:3000'})

const Pdf = ({text}: {text: string}) => {
  return (
    <Document>
      <Page>
        <Text>{text}</Text>
      </Page>
    </Document>
  )
}

const useGeneratePdf = () => {
  const {isPending: isCreatePending, error: createError, data: createDocument, mutate, isIdle} = useMutation<PdfDocumentDetails, Error, {document: JSX.Element}>({
    mutationKey: ['pdf-document', 'create'],
    mutationFn: async ({document}) => await api.initiatePdfCreation({document}),
    onSuccess: (data) => {
      console.log('onSuccess', data);
    }
  });

  const {isPending: isPollingPending, error: pollingError, data: pollingDocument} = useQuery({
    
    queryKey: ['pdf-document', 'polling'],

    queryFn: ({signal}) => api.getPdfDocumentDetails({
      documentId: createDocument!.id,
      signal
    }),

    refetchInterval: (query) => {
      return query.state.data?.status === 1 ? 2000 : undefined
    },

    refetchIntervalInBackground: true,

    enabled: !!createDocument
  });

  return {
    isIdle,
    isPending: isCreatePending || isPollingPending,
    error: createError ?? pollingError,
    pdfDocument: pollingDocument ?? createDocument,
    generatePdf: mutate
  }
}

export const GeneratePdfButton = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    error,
    isIdle,
    isPending,
    pdfDocument,
    generatePdf
  } = useGeneratePdf();

  const createPdf = async () => {
    if (!inputRef.current) {
      return;
    }

    generatePdf({
      document: <Pdf text={inputRef.current.value}/>
    });
  }

  if (isIdle) {
    return (
      <>
        <input ref={inputRef} placeholder='text inside the pdf'/>
        <button onClick={createPdf}>
          Generate Pdf
        </button>
      </>
    )
  }

  if (error) {
    console.log(error);
    return <p>Error occurred: {error.toString()}</p>
  }
  

  if (isPending || pdfDocument!.status === 1 /* Generating */) {
    return (
      <button disabled>
        Generating pdf...
      </button>
    )
  }

  return (
    <a href={api.getDownloadUrl({documentId: pdfDocument!.id})}>
      Download Pdf
    </a>
  )
}