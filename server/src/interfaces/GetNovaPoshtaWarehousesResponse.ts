export default interface GetNovaPoshtaWarehousesResponse {
    success: boolean;
    data: WarehouseData[];
    errors: any[];
    warnings: any[];
    info: {
        totalCount: number;
    };
    messageCodes: any[];
    errorCodes: any[];
    warningCodes: any[];
    infoCodes: any[];
}

interface WarehouseData {
    SiteKey: string;
    Description: string;
    DescriptionRu: string;
    ShortAddress: string;
    ShortAddressRu: string;
    Phone: string;
    TypeOfWarehouse: string;
    Ref: string;
    Number: string;
    CityRef: string;
    CityDescription: string;
    CityDescriptionRu: string;
    SettlementRef: string;
    SettlementDescription: string;
    SettlementAreaDescription: string;
    SettlementRegionsDescription: string;
    SettlementTypeDescription: string;
    SettlementTypeDescriptionRu: string;
    Longitude: string;
    Latitude: string;
    PostFinance: string;
    BicycleParking: string;
    PaymentAccess: string;
    POSTerminal: string;
    InternationalShipping: string;
    SelfServiceWorkplacesCount: string;
    TotalMaxWeightAllowed: string;
    PlaceMaxWeightAllowed: string;
    SendingLimitationsOnDimensions: {
        Width: number;
        Height: number;
        Length: number;
    };
    ReceivingLimitationsOnDimensions: {
        Width: number;
        Height: number;
        Length: number;
    };
    Reception: OpeningHours;
    Delivery: OpeningHours;
    Schedule: OpeningHours;
    DistrictCode: string;
    WarehouseStatus: string;
    WarehouseStatusDate: string;
    WarehouseIllusha: string;
    CategoryOfWarehouse: string;
    Direct: string;
    RegionCity: string;
    WarehouseForAgent: string;
    GeneratorEnabled: string;
    MaxDeclaredCost: string;
    WorkInMobileAwis: string;
    DenyToSelect: string;
    CanGetMoneyTransfer: string;
    HasMirror: string;
    HasFittingRoom: string;
    OnlyReceivingParcel: string;
    PostMachineType: string;
    PostalCodeUA: string;
    WarehouseIndex: string;
    BeaconCode: string;
}

interface OpeningHours {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
}
