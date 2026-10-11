import { Keypair } from "@stellar/stellar-sdk";

const seed = (byte: number) => Keypair.fromRawEd25519Seed(Buffer.alloc(32, byte));

export const accountId = seed(61).publicKey();
export const counterparty = seed(62).publicKey();
export const secretSeed = seed(63).secret();

export const hugeCursorString = "a".repeat(4000);
export const encodedCursorString = "token%2Fabc%2B123%3D%3D";

export const validCollectionObj = {
  _links: {
    self: {
      href: "https://horizon.stellar.org/accounts/GAA/operations?cursor=100&limit=10&order=asc"
    },
    next: {
      href: "https://horizon.stellar.org/accounts/GAA/operations?cursor=300&limit=10&order=asc"
    },
    prev: {
      href: "https://horizon.stellar.org/accounts/GAA/operations?cursor=100&limit=10&order=desc"
    }
  },
  _embedded: {
    records: [
      {
        id: "12884905985",
        paging_token: "12884905985",
        type: "payment",
        source_account: accountId
      },
      {
        id: "12884905986",
        paging_token: "12884905986",
        type: "create_account",
        source_account: accountId
      },
      {
        id: "12884905987",
        paging_token: "12884905987",
        type: "payment",
        source_account: counterparty
      }
    ]
  }
};

export const validCollectionJson = JSON.stringify(validCollectionObj, null, 2);

export const emptyRecordsCollectionObj = {
  _links: {
    self: {
      href: "https://horizon.stellar.org/transactions?cursor=500&limit=10&order=asc"
    },
    next: {
      href: "https://horizon.stellar.org/transactions?cursor=500&limit=10&order=asc"
    },
    prev: {
      href: "https://horizon.stellar.org/transactions?cursor=500&limit=10&order=desc"
    }
  },
  _embedded: {
    records: []
  }
};

export const emptyRecordsCollectionJson = JSON.stringify(
  emptyRecordsCollectionObj,
  null,
  2
);

export const duplicateIdsCollectionObj = {
  _links: {
    self: {
      href: "https://horizon.stellar.org/ledgers?cursor=10&limit=10&order=asc"
    }
  },
  _embedded: {
    records: [
      { id: "dup-id-999", paging_token: "token-1" },
      { id: "unique-id-1", paging_token: "token-2" },
      { id: "dup-id-999", paging_token: "token-3" }
    ]
  }
};

export const duplicateIdsCollectionJson = JSON.stringify(
  duplicateIdsCollectionObj,
  null,
  2
);

export const duplicateTokensCollectionObj = {
  _links: {
    self: {
      href: "https://horizon.stellar.org/ledgers?cursor=10&limit=10&order=asc"
    }
  },
  _embedded: {
    records: [
      { id: "rec-1", paging_token: "dup-token-555" },
      { id: "rec-2", paging_token: "dup-token-555" }
    ]
  }
};

export const duplicateTokensCollectionJson = JSON.stringify(
  duplicateTokensCollectionObj,
  null,
  2
);

export const missingMetadataCollectionObj = {
  _links: {
    self: {
      href: "https://horizon.stellar.org/operations?cursor=1"
    }
  },
  _embedded: {
    records: [
      { paging_token: "token-only" },
      { id: "id-only" }
    ]
  }
};

export const missingMetadataCollectionJson = JSON.stringify(
  missingMetadataCollectionObj,
  null,
  2
);

export const hugeCursorCollectionObj = {
  _links: {
    self: {
      href: `https://horizon.stellar.org/effects?cursor=${hugeCursorString}&limit=200&order=asc`
    },
    next: {
      href: `https://horizon.stellar.org/effects?cursor=${hugeCursorString}&limit=200&order=asc`
    }
  },
  _embedded: {
    records: [
      { id: "huge-rec-1", paging_token: hugeCursorString }
    ]
  }
};

export const hugeCursorCollectionJson = JSON.stringify(
  hugeCursorCollectionObj,
  null,
  2
);

export const encodedCursorCollectionObj = {
  _links: {
    self: {
      href: `https://horizon.stellar.org/trades?cursor=${encodedCursorString}&limit=50&order=desc`
    },
    next: {
      href: `https://horizon.stellar.org/trades?cursor=${encodedCursorString}&limit=50&order=desc`
    }
  },
  _embedded: {
    records: [
      { id: "trade-1", paging_token: "trade-token-1" }
    ]
  }
};

export const encodedCursorCollectionJson = JSON.stringify(
  encodedCursorCollectionObj,
  null,
  2
);

export const offOriginCollectionObj = {
  _links: {
    self: {
      href: "https://malicious-external-site.com/accounts/GAA/operations"
    },
    next: {
      href: "https://malicious-external-site.com/accounts/GAA/operations?cursor=99"
    }
  },
  _embedded: {
    records: [
      { id: "op-1", paging_token: "tok-1" }
    ]
  }
};

export const offOriginCollectionJson = JSON.stringify(
  offOriginCollectionObj,
  null,
  2
);

export const hostileLinksCollectionObj = {
  _links: {
    self: {
      href: "javascript:alert(1)"
    },
    next: {
      href: "data:text/html,<script>evil()</script>"
    },
    templated: {
      href: "https://horizon.stellar.org/operations{?cursor,limit,order}",
      templated: true
    }
  },
  _embedded: {
    records: []
  }
};

export const hostileLinksCollectionJson = JSON.stringify(
  hostileLinksCollectionObj,
  null,
  2
);

export const malformedJson = '{ "_embedded": { "records": [ invalid json';

export const nonCollectionJson = JSON.stringify({
  greeting: "hello",
  status: "ok"
});

export const secretSeedInput = JSON.stringify({
  _links: { self: { href: "https://horizon.stellar.org" } },
  _embedded: { records: [{ id: "1", secret: secretSeed }] }
});
