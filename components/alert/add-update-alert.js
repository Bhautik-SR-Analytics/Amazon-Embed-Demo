import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import ButtonWithLoader from "../buttonwithloader";

const AddUpdateAlert = ({ onSubmit, currentAlert, loader }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(alertData);
    };

    const [alertData, setAlertData] = useState({
        id: currentAlert?.id ?? undefined,
        alert_name: currentAlert?.alert_name ?? "",
        metric: currentAlert?.metric ?? "",
        condition: currentAlert?.condition + "" ?? "",
        value: currentAlert?.value ?? "",
        frequency: currentAlert?.frequency + "" ?? "",
        destination_platform: currentAlert?.destination_platform ?? "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAlertData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSelectChange = (key, value) => {
        setAlertData(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 leading-relaxed p-2">
            <div>
                <Label htmlFor="alert_name">Alert Name</Label>
                <Input id="alert_name" name="alert_name" type="text" required placeholder="Enter name" value={alertData["alert_name"]} onChange={handleInputChange} />
            </div>
            <div className="space-y-4 max-w-full">
                <div className="flex space-x-2 items-center">
                    <Label className="block w-[200px] text-lg font-semibold text-gray-800">Alert me when</Label>
                    <Select name="metric" value={alertData["metric"]} onValueChange={(value) => handleSelectChange("metric", value)} required>
                        <SelectTrigger className="block w-full border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 flex justify-between items-center">
                            <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="cancels_0_to_3_days">Cancels (0-3 Days)</SelectItem>
                                <SelectItem value="cancels">Cancels</SelectItem>
                                <SelectItem value="per_cancels">% Cancels</SelectItem>
                                <SelectItem value="rebill_cycle_1_per">Rebill Cycle 1 %</SelectItem>
                                <SelectItem value="initials">Initials</SelectItem>
                                <SelectItem value="initials_revenue">Initials Revenue</SelectItem>
                                <SelectItem value="rebills">Rebills</SelectItem>
                                <SelectItem value="rebills_revenue">Rebills Revenue</SelectItem>
                                <SelectItem value="straight_sales">Straight Sales</SelectItem>
                                <SelectItem value="straight_sales_revenue">Straight Sales Revenue</SelectItem>
                                <SelectItem value="gross_revenue">Gross Revenue</SelectItem>
                                <SelectItem value="net_revenue">Net Revenue </SelectItem>
                                <SelectItem value="refund_count">Refund Count</SelectItem>
                                <SelectItem value="refund">Refund $</SelectItem>
                                <SelectItem value="chargebacks_count">Chargebacks Count</SelectItem>
                                <SelectItem value="chargebacks">Chargebacks $</SelectItem>
                                <SelectItem value="initials_approval_rate">Initials Approval Rate</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex space-x-2 items-center">
                    <Label className="block text-lg font-semibold text-gray-800">Hits</Label>
                    <Select name="condition" value={alertData["condition"]} onValueChange={(value) => handleSelectChange("condition", value)} required>
                        <SelectTrigger className="block w-full border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 flex justify-between items-center">
                            <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="true">Above</SelectItem>
                                <SelectItem value="false">Below</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        name="value"
                        type="number"
                        step="any"
                        value={alertData["value"]}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter value"
                        className="mt-1 block w-full border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 outline-none flex justify-between items-center"
                    />

                </div>

                <div className="flex space-x-2 items-center">
                    <Label className="block text-lg font-semibold text-gray-800">on a</Label>
                    <Select name="frequency" value={alertData["frequency"]} onValueChange={(value) => handleSelectChange("frequency", value)} required>
                        <SelectTrigger className="block w-[200px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 flex justify-between items-center">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="0">Daily</SelectItem>
                                <SelectItem value="1">Weekly</SelectItem>
                                <SelectItem value="2">Monthly</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Label className="block text-lg font-semibold text-gray-800">basis.</Label>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Deliver alert on</Label>
                <Select name="destination_platform" value={alertData["destination_platform"]} onValueChange={(value) => handleSelectChange("destination_platform", value)} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="email">Email</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Card className="w-full bg-teal-50">
                    <CardHeader>
                        <CardDescription className="text-base">In last 90 days, this <b>metric</b></CardDescription>
                        <CardDescription className="text-base">Has been trending with</CardDescription>
                    </CardHeader>

                    <CardContent className="flex space-x-4">
                        <div className="flex items-center space-x-4 rounded-md border p-4 bg-white">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    25.3k
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Daily Avg
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 rounded-md border p-4 bg-white">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    17.6k
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Weekly Avg
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 rounded-md border p-4 bg-white">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    14.9k
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Monthly Avg
                                </p>
                            </div>
                        </div>
                    </CardContent>

                </Card>
            </div>

            <div className="flex justify-end">
                <ButtonWithLoader
                    type="submit"
                    name="save"
                    size="default"
                    buttonText="Save"
                    loader={loader}
                />
            </div>
        </form>
    );
};

export default AddUpdateAlert;