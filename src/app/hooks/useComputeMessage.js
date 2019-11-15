import { useCallback } from 'react';
import { useCache } from 'react-components';
import { transformEscape } from '../helpers/transforms/transformEscape';
import { transformLinks } from '../helpers/transforms/transformLinks';
import { transformEmbedded } from '../helpers/transforms/transformEmbedded';
import { transformWelcome } from '../helpers/transforms/transformWelcome';
import { transformBlockquotes } from '../helpers/transforms/transformBlockquotes';
import { transformStylesheet } from '../helpers/transforms/transformStylesheet';
import { transformRemote } from '../helpers/transforms/transformRemote';
import { transformBase } from '../helpers/transforms/transformBase';
import { useDecryptMessage } from './useDecryptMessage';
import { useLoadMessage } from './useLoadMessage';
import { useMarkAsRead } from './useMarkAsRead';
import { useTransformAttachments } from './useAttachments';

// Reference: Angular/src/app/message/services/prepareContent.js

export const useComputeMessage = (mailSettings) => {
    const cache = useCache();
    const load = useLoadMessage();
    const markAsRead = useMarkAsRead();
    const decrypt = useDecryptMessage();
    const transformAttachements = useTransformAttachments();

    const transforms = [
        transformEscape,
        transformBase,
        transformLinks,
        transformEmbedded,
        transformWelcome,
        transformBlockquotes,
        transformStylesheet,
        transformAttachements,
        transformRemote
    ];

    /**
     * Run a computation on a message, wait until it finish
     * Return the message extanded with the result of the computation
     */
    const run = useCallback(async (message, compute, action) => {
        const result = (await compute(message, { action, cache, mailSettings })) || {};

        if (result.document) {
            result.content = result.document.innerHTML;
        }

        return { ...message, ...result };
    });

    /**
     * Run a list of computation sequentially
     */
    const runSerial = useCallback(async (message, computes, action) => {
        return await computes.reduce(async (messagePromise, compute) => {
            return run(await messagePromise, compute, action);
        }, message);
    });

    // TODO: Handle cache?
    const initialize = useCallback((message, action) => {
        return runSerial(message, [load, markAsRead, decrypt, ...transforms], action);
    });

    const loadRemoteImages = useCallback((message, action) => {
        return run({ ...message, showRemoteImages: true }, transformRemote, action);
    });

    const loadEmbeddedImages = useCallback((message, action) => {
        return runSerial({ ...message, showEmbeddedImages: true }, [transformEmbedded, transformAttachements], action);
    });

    return { run, runSerial, initialize, loadRemoteImages, loadEmbeddedImages };
};