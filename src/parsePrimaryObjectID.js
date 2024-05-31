const parsePrimaryObjectID = (primaryObjectID) => {
    const parts = primaryObjectID.split(':');
    if (parts.length < 4) {
        throw new Error('Invalid PrimaryObjectID format');
    }
    
    const type = parts[1];
    const taskId = parts[2];
    const segments = parts[3].split('@')[0].split('-');
    
    if (segments.length < 4) {
        throw new Error('Invalid segments in PrimaryObjectID');
    }
    
    const defineOfSetupYield = segments[0];
    const defineOfTestYield = segments[1];
    const key = segments[2];
    
    return {
        taskId,
        defineOfSetupYield,
        defineOfTestYield,
        key
    };
};

module.exports = parsePrimaryObjectID;
