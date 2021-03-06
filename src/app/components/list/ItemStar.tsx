import React from 'react';
import { Icon, useLoading, useApi, useEventManager, classnames } from 'react-components';
import { MAILBOX_LABEL_IDS } from 'proton-shared/lib/constants';
import { labelMessages, unlabelMessages } from 'proton-shared/lib/api/messages';
import { labelConversations, unlabelConversations } from 'proton-shared/lib/api/conversations';

import { Element } from '../../models/element';
import { isConversation as isConversationTest, getLabelIDs } from '../../helpers/elements';

interface Props {
    element?: Element;
}

const ItemStar = ({ element = {} }: Props) => {
    const api = useApi();
    const isConversation = isConversationTest(element);
    const { call } = useEventManager();
    const [loading, withLoading] = useLoading();
    const labelIDs = getLabelIDs(element);
    const isStarred = labelIDs?.includes(MAILBOX_LABEL_IDS.STARRED);
    const iconName = isStarred ? 'starfull' : 'star';

    const handleClick = async () => {
        const action = isConversation
            ? isStarred
                ? unlabelConversations
                : labelConversations
            : isStarred
            ? unlabelMessages
            : labelMessages;
        await api(action({ LabelID: MAILBOX_LABEL_IDS.STARRED, IDs: [element.ID] }));
        await call();
    };

    return (
        <button
            disabled={loading}
            type="button"
            className={classnames(['starbutton item-star inline-flex', isStarred && 'starbutton--is-starred'])}
            onClick={() => withLoading(handleClick())}
        >
            <Icon name={iconName} fill="" />
        </button>
    );
};

export default ItemStar;
